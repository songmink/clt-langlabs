$(document).ready(function(){

        
        $(".course_result_div").hide()
        

        $( "#searchInput" ).focusin(function() {
        		cursorInSearchBox=true;
        		currentMouseOver = true
		})
			.focusout(function() {

		        cursorInSearchBox=false
		        currentMouseOver = false
		});

		// toggle bewteen auto complete results
		$("#searchInput").keydown(function (event) {
            if (event.keyCode == 13) {
		    	if($("#searchInput").val().trim()!=''){
		    		if($(".list-group-item .autoSelected").size()!=0){
		    			$("#searchInput").val($(".list-group-item .autoSelected").text())
		    		}
		    		$( ".courseSearchButton" ).trigger( "click" );
		    	}
		    }
			if(currentMouseOver){

			    if (event.keyCode == 38) {
	                event.preventDefault();
	                if(currentMouseOverObject){

	                }else{
	                	currentMouseOverObject = $("#autoComplete").children().first()
		               	currentMouseOverObject.addClass("autoSelected")
	                	return false
	                }
			    	if(currentMouseOverObject.prev().size()!=0){
			    		currentMouseOverObject.removeClass('autoSelected')
			    		currentMouseOverObject.prev().addClass('autoSelected')
			    		currentMouseOverObject = currentMouseOverObject.prev()
			    	}else{
			    		currentMouseOverObject.removeClass('autoSelected')
		            	currentMouseOverObject = $("#autoComplete").children().last()
	                	currentMouseOverObject.addClass("autoSelected")
	                	return false
			    	}
			    }

			    if (event.keyCode == 40) {
			    	event.preventDefault();
	                if(currentMouseOverObject){

	                }else{
	                	currentMouseOverObject = $("#autoComplete").children().first()
	                	currentMouseOverObject.addClass("autoSelected")
	                	return false
	                }
			    	if(currentMouseOverObject.next().size()!=0){
			    		currentMouseOverObject.removeClass('autoSelected')
			    		currentMouseOverObject.next().addClass('autoSelected')
			    		currentMouseOverObject = currentMouseOverObject.next()
			    	}else{
			    		currentMouseOverObject.removeClass('autoSelected')
		            	currentMouseOverObject = $("#autoComplete").children().first()
	                	currentMouseOverObject.addClass("autoSelected")
	                	return false
			    	}
			    }
			}
		});


		// select auto complete result
        $( "#autoComplete" ).on( "click", ".autoKey", function() {
		    $("#searchInput").val($(this).text());
		});

        // generate key words out of the course db information
   	    courses().each(function (record,recordnumber) {
			keywords.insert({keyword:record["course_name"]});
			for(i=0; i<record["instructors"].length;i++){
				if(keywords({keyword:{has:record["instructors"][i]}}).first()){

				}else{
					keywords.insert({keyword:record["instructors"][i]});
				}
				
			} 
		});

		// automatically check input and show auto complete
	    previousSearchInput = $("#searchInput").val();
		var searchTimer=setInterval(function () {
			checkSearchInputUpdate();
			checkAutoComplete();
		}, 300);
        

        $(".courseSearchButton").click(function(){
        	displaySearchResults()
        })

        // check if the input content has changed
		function checkSearchInputUpdate() {
		    if(previousSearchInput == $("#searchInput").val()){

		    }else{
		    	currentMouseOverObject = null
		    	$("#autoComplete").children().remove()
		    	if($("#searchInput").val()==''){

		    	}else{
			    	previousSearchInput = $("#searchInput").val()
			    	var resultString =""
			    	keywords({keyword:{like:$("#searchInput").val()}}).each(function(record, recordnumber){
			    		var tempStr = '<a class="list-group-item autoKey">'+record['keyword']+'</a>'
			    		$("#autoComplete").append(tempStr)
			    	})
		    	}
		    }

		}

		// check if the auto complete div should be shown
		function checkAutoComplete() {
                
                if(cursorInSearchBox && $("#autoComplete").children().size()!=0){
                      $("#autoComplete").show()
                }else{
                      $("#autoComplete").hide()   // should be hide
                }

		}

		// Display the search result
		function displaySearchResults(){
                // code for result
		    	$("#searchResult").children().remove()
		    	var searchKey = $("#searchInput").val()
		    	var resultString =""
		    	var resultCourses = courses([{course_name:{likenocase:$("#searchInput").val()}},{instructors:{likenocase:$("#searchInput").val()}}])

		    	$("#searchInput").val("")
		    	var selectedCourseNames=resultCourses.select("course_name") 

		    	$(".course_result_div").show()
	        	$(".course_row").each(function(){
	                if(selectedCourseNames.indexOf($(this).data("coursename"))!= -1){
	                	$(this).show()

	                }else{
	                	$(this).hide()

	                }        		
	        	
	        	})
		}

	});
