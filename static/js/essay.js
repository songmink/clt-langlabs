// essay.js

//= requires utils.js
//= requires global.js

$(document).ready(function(){

    ActivityPermissionsAdmin.init();
    ActivityCopy.init();
    RichTextEditor.init('essay');
    JumpToUser.init();
    EssayResponseDiscussion.init();

    // shows activity participants if activity membership control is on
    $(".activity_members_togg").click(function(){
      $("#activity_members_div").toggle(20)
    })

    // save or submit a draft
    $(".draftEditBtn").click(function(){
        var ajax_url = $(this).data('ajaxurl');
        var csrftoken = $('input[name=csrfmiddlewaretoken]').val();
        var operation = $(this).data('operation');
        var data =  { 
            operation: operation,
            essay_id: $(this).data("essayid"),
            draft_title: $("#draft_title").val().trim(),
            draft_content: tinymce.get('essayTextarea').getContent(),
        };
        Ajax.post(ajax_url, data, csrftoken, function(msg) {
            if (msg=='Success' && operation=='submit') {
                // reload page: we need to update submitted_essay_responses.count
                window.location.reload(true);
            }
        });
    });

    // toggle between draftbook and discussion
    if($(".essaySectionToggle").size()>0){
        $( ".essaySectionToggle" ).on( "click", '.sectionToggle',function(event) {
            event.preventDefault();
            $(this).closest("div").find(".sectionToggle").removeClass('active')
            $(this).addClass('active');
            var tempShow = $(this).closest("div").find(".sectionToggle.active").find('input').first().val()
            $("#"+tempShow).show("fast");
            $(this).closest("div").find(".sectionToggle").not(".active").find('input').each(function(){
                var temp_noShow = $(this).val();
                $("#"+temp_noShow).hide("fast");
            })
        });
    }

    // tooltips
    $('.aa-tooltip').tooltip();
});

