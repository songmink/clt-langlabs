# sockets.py
import logging

from socketio.namespace import BaseNamespace
from socketio.mixins import RoomsMixin, BroadcastMixin
from socketio.sdjango import namespace
from django.contrib.auth.models import User

from datetime import datetime
import pdb
from core.models import Post
from .models import DiscussionActivity


@namespace('/discussionsPosts')
class ThreadNamespace(BaseNamespace, RoomsMixin, BroadcastMixin):
    nicknames = []

    def initialize(self):
        self.logger = logging.getLogger("socketio.discussions")
        self.log("Socketio session started")
        
    def log(self, message):
        self.logger.info("[{0}] {1}".format(self.socket.sessid, message))
        print self.socket.sessid
    
    def on_join(self, room):
        self.room = room
        self.join(room)
        try: 
            self.socket.session['DjangoRoom'] = DiscussionActivity.objects.get(pk=room)
        except:
            self.broadcast_event('error', '%s is not valid activity and has disconnected' % room)
            self.disconnect(silent=True)
        self.log("Joining room.")
        return True
        
    def on_nickname(self, nickname):
        self.log('Connected nickname is: {0}'.format(nickname))
        self.nicknames.append(nickname)
        self.socket.session['nickname'] = nickname
        # pdb.set_trace()
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
        # save to threadmessage model: threadspace, user, content
        self.log('User message: {0}'.format(msg))
        savedMessage=self.postSave(msg)
        thisID = savedMessage.id
        if savedMessage:
            self.emit_to_room_include_me(self.room, 'msg_to_room', self.socket.session['nickname'], msg, str(savedMessage.created.strftime("%B %d, %Y, %I:%M %p")), thisID)
            return True
        else:
            return False

    def on_user_comment(self, msg, parentID):
        # save to threadmessage model: threadspace, user, content
        self.log('User comment: {0}'.format(msg))
        savedMessage=self.postSave(msg, parent_post=parentID)
        thisID = savedMessage.id
        if savedMessage:
            self.emit_to_room_include_me(self.room, 'cmt_to_room', self.socket.session['nickname'], msg, str(savedMessage.created.strftime("%B %d, %Y, %I:%M %p")), thisID, parentID)
            return True
        else:
            return False

    def postSave(self, msg, parent_post=None, audio_URL=None):
        postuser = self.socket.session['DjangoUser']
        textcontent = msg
        # activity to assign post to
        activityType = 'discussion'
        activityID = self.room
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
            print "message successfully saved to database"
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