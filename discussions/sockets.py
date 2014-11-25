# sockets.py
import logging
import json

from socketio.namespace import BaseNamespace
from socketio.mixins import RoomsMixin, BroadcastMixin
from socketio.sdjango import namespace
from django.contrib.auth.models import User
from django.contrib.contenttypes.models import ContentType

from datetime import datetime
import pdb
from core.models import Post, Document
from overdub_discussions.models import OverdubActivity
from .models import DiscussionActivity


@namespace('/discussionsPosts')
class ThreadNamespace(BaseNamespace, RoomsMixin, BroadcastMixin):
    nicknames = []

    def initialize(self):
        self.logger = logging.getLogger("socketio.discussions")
        self.log("Socketio session started")
        
    def log(self, message):
        self.logger.info("[{0}] {1}".format(self.socket.sessid, message))
    
    def on_join(self, roomType, roomNumber):
        # print self
        # print "roomType is: "+roomType+" roomNumber is: "+roomNumber
        self.room = roomType+'_'+roomNumber
        self.join(roomType+'_'+roomNumber)
        try: 
            if roomType=='discussion':
                self.socket.session['DjangoRoom'] = DiscussionActivity.objects.get(pk=roomNumber)
            elif roomType =='overdub':
                self.socket.session['DjangoRoom'] = OverdubActivity.objects.get(pk=roomNumber)
        except:
            self.broadcast_event('error', '%s is not valid activity and has disconnected' % room)
            self.disconnect(silent=True)
        self.socket.session['roomType'] = roomType
        self.socket.session['roomNumber'] = roomNumber
        self.log("Joining room.")
        return True
        
    def on_nickname(self, nickname):
        self.log('Connected nickname is: {0}'.format(nickname))
        self.nicknames.append(nickname)
        self.socket.session['nickname'] = nickname
        try:
            self.socket.session['DjangoUser']= User.objects.get(username=nickname)
        except:
            self.broadcast_event('error', '%s is not valid user and has disconnected' % nickname)
            self.disconnect(silent=True)
            return False
        self.broadcast_event('announcement', '%s has connected' % nickname)
        self.broadcast_event('nicknames', self.nicknames)
        return nickname

    def recv_disconnect(self):
        # Remove nickname from the list.
        self.log('Disconnected')
        nickname = self.socket.session['nickname']
        self.nicknames.remove(nickname)
        self.broadcast_event('announcement', '%s has disconnected' % nickname)
        self.broadcast_event('nicknames', self.nicknames)
        self.disconnect(silent=True)
        return True

    def on_user_message(self, msg):
        # save to Post model: 
        # self.log('User message: {0}'.format(msg["msg"]))
        savedMessage=self.postSave(msg["msg"], attachments = msg["attaches"], attachmentsName = msg["attachesName"], audio_URL=msg["audioURL"])
        thisID = savedMessage.id
        if savedMessage:
            responseMessage = {"fromMessage":self.socket.session['nickname'], "message":msg, "createTime":str(savedMessage.created.strftime("%B %d, %Y, %I:%M %p")), "msgID":thisID}
            self.emit_to_room_include_me(self.room, 'msg_to_room', json.dumps(responseMessage))
            return True
        else:
            return False

    def on_user_comment(self, msg):
        # save to Post model as a comment
        self.log('User comment: {0}'.format(msg["cmt"]))
        savedMessage=self.postSave(msg["cmt"], parent_post=msg["parentID"])
        thisID = savedMessage.id
        # respond to js part and append the message in the html
        if savedMessage:
            responseMessage = {"fromMessage":self.socket.session['nickname'], "message":msg, "createTime": str(savedMessage.created.strftime("%B %d, %Y, %I:%M %p")), "msgID":thisID, "parentPost": msg["parentID"]}
            self.emit_to_room_include_me(self.room, 'cmt_to_room', json.dumps(responseMessage))
            return True
        else:
            return False

    def postSave(self, msg, parent_post=None, audio_URL=None, attachments = None, attachmentsName = None):
        postuser = self.socket.session['DjangoUser']
        textcontent = msg
        # activity to assign post to
        activityType = self.socket.session['roomType']
        activityID = self.socket.session['roomNumber']
        #  validation and save
        if len(textcontent) > 0:
            mess = Post(text=textcontent)
            mess.creator = postuser
        if parent_post:
            mess.parent_post = Post.objects.get(pk=parent_post)
        if audio_URL:
            mess.audio_URL = audio_URL
        if mess:
            mess.save()
            # print "message successfully saved to database"
            #  bind message to the document
            if attachments:
                for attachment in attachments:
                    # accessURL is "media/documents/filename"
                    targetDoc = Document.objects.filter(accessURL = attachment)[0]
                    targetDoc.content_object = mess
                    targetDoc.save()
            #  save mess with that activity
            activity = self.socket.session['DjangoRoom']
            activity.posts.add(mess)
            return mess
        else:
            return False
    # replace original room mixin's emit to room function which does not send msg to original sender
    def emit_to_room_include_me(self, room, event, *args):
        """This is sent to all in the room (in this particular Namespace)"""
        pkt = dict(type="event",
                   name=event,
                   args=args,
                   endpoint=self.ns_name)
        room_name = self._get_room_name(room)
        for sessid, socket in self.socket.server.sockets.iteritems():
            if 'rooms' not in socket.session:
                continue
            if room_name in socket.session['rooms']:
                socket.send_packet(pkt)