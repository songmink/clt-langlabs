// course_list.js

$(document).ready(function(){

    // suggestion engine for courses
    var bloodhound_courses = new Bloodhound({
        datumTokenizer: Bloodhound.tokenizers.obj.whitespace('course_name'),
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        local: courses_json,
    });

    // suggestion engine for instructors
    var bloodhound_instructors = new Bloodhound({
        datumTokenizer: Bloodhound.tokenizers.whitespace,
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        local: single_instructors,
    });
    
    // typeahead settings
    $('#course_search').typeahead(null, {
        name: 'bloodhound_courses',
        display: 'course_name',
        limit: 7,
        source: bloodhound_courses,
    },
    {
        name: 'bloodhound_instructors',
        limit: 7,
        source: bloodhound_instructors,
    });

    // event listeners
    $('#course_search_button').click(function () {
       displaySearchResults();
    });

    $('#course_search').keyup(function () {
        if (event.keyCode == 13) displaySearchResults();
    });
     
});

// displays courses which have as substring the value of the search input
function displaySearchResults() {
    // query taffy db
    var search_key = $("#course_search").val();
    var result_courses = courses([
        { course_name: {likenocase: search_key} },
        { instructors: {likenocase: search_key} },
    ]);
    // display results
    var course_names = result_courses.select("course_name") ;
    $(".course_result_div").show();
    $(".course_row").each(function () {
        if (course_names.indexOf($(this).data("coursename")) != -1) {
            $(this).show();
        }else {
            $(this).hide();
        }               
    });
}
