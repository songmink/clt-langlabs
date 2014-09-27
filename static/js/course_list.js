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
	                console.log(currentMouseOverObject)
	                if(currentMouseOverObject){

	                }else{
	                	console.log("1")
	                	currentMouseOverObject = $("#autoComplete").children().first()
		               	currentMouseOverObject.addClass("autoSelected")
	                	return false
	                }
			    	if(currentMouseOverObject.prev().size()!=0){
			    		console.log("2")
			    		currentMouseOverObject.removeClass('autoSelected')
			    		currentMouseOverObject.prev().addClass('autoSelected')
			    		currentMouseOverObject = currentMouseOverObject.prev()
			    	}else{
			    		console.log("3")
			    		currentMouseOverObject.removeClass('autoSelected')
		            	currentMouseOverObject = $("#autoComplete").children().last()
	                	currentMouseOverObject.addClass("autoSelected")
	                	return false
			    	}
			    }

			    if (event.keyCode == 40) {
			    	event.preventDefault();
			    	console.log(currentMouseOverObject)
	                if(currentMouseOverObject){

	                }else{
	                	console.log("4")
	                	currentMouseOverObject = $("#autoComplete").children().first()
	                	currentMouseOverObject.addClass("autoSelected")
	                	return false
	                }
			    	if(currentMouseOverObject.next().size()!=0){
			    		console.log("5")
			    		currentMouseOverObject.removeClass('autoSelected')
			    		currentMouseOverObject.next().addClass('autoSelected')
			    		currentMouseOverObject = currentMouseOverObject.next()
			    	}else{
			    		console.log("6")
			    		currentMouseOverObject.removeClass('autoSelected')
		            	currentMouseOverObject = $("#autoComplete").children().first()
	                	currentMouseOverObject.addClass("autoSelected")
	                	return false
			    	}
			    }
			}
		});



        $( "#autoComplete" ).on( "click", ".autoKey", function() {
		    $("#searchInput").val($(this).text());
		});

   	    courses().each(function (record,recordnumber) {
			keywords.insert({keyword:record["course_name"]});
			for(i=0; i<record["instructors"].length;i++){
				if(keywords({keyword:{has:record["instructors"][i]}}).first()){

				}else{
					keywords.insert({keyword:record["instructors"][i]});
				}
				
			} 
		});
		console.log(keywords().stringify())
	    previousSearchInput = $("#searchInput").val();
		var searchTimer=setInterval(function () {
			checkSearchInputUpdate();
			checkAutoComplete();
		}, 300);
        
        $(".courseSearchButton").click(function(){
        	displaySearchResults()
        })
		function checkSearchInputUpdate() {
		    if(previousSearchInput == $("#searchInput").val()){

		    }else{
		    	currentMouseOverObject = null
		    	$("#autoComplete").children().remove()
		    	if($("#searchInput").val()==''){

		    	}else{
			    	previousSearchInput = $("#searchInput").val()
			    	console.log("updated")
			    	var resultString =""
			    	// console.log(keywords([{course_name:{like:$("#searchInput").val()}},{instructors:{like:$("#searchInput").val()}}]).stringify())
			    	keywords({keyword:{like:$("#searchInput").val()}}).each(function(record, recordnumber){
			    		var tempStr = '<a class="list-group-item autoKey">'+record['keyword']+'</a>'
			    		$("#autoComplete").append(tempStr)
			    	})
		    	}
		    }
		    // currentMouseOverObject = $("#autoComplete").children().first()
		}

		function checkAutoComplete() {
                
                if(cursorInSearchBox && $("#autoComplete").children().size()!=0){
                      $("#autoComplete").show()
                }else{
                      $("#autoComplete").hide()   // should be hide
                }

		}

		function displaySearchResults(){
                // code for result
		    	$("#searchResult").children().remove()
		    	var searchKey = $("#searchInput").val()
		    	var resultString =""
		    	console.log(courses([{course_name:{like:$("#searchInput").val()}},{instructors:{like:$("#searchInput").val()}}]).stringify())
		    	var resultCourses = courses([{course_name:{like:$("#searchInput").val()}},{instructors:{like:$("#searchInput").val()}}])
		    	// resultCourses.each(function(record, recordnumber){
		    	// 	var tempStr = "<p>"+"course: "+record['course_name']+"   "+"| instructors: "
		    	// 	for(i=0; i<record["instructors"].length;i++){
		    	// 		tempStr+=record["instructors"][i]+' '
		    	// 	}
		    	// 	tempStr+="</p>"
		    	// 	$("#searchResult").append(tempStr)
		    	// })
		    	$("#searchInput").val("")
		    	var selectedCourseNames=resultCourses.select("course_name") 
                // console.log("selectedCourseNames : ")
		    	// console.log(selectedCourseNames)
		    	$(".course_result_div").show()
	        	$(".course_row").each(function(){
	                if(selectedCourseNames.indexOf($(this).data("coursename"))!= -1){
	                	$(this).show()
	                	// console.log("display")
	                }else{
	                	$(this).hide()
	                	// console.log('hide')
	                }        		
	        	
	        	})
		}

	});
