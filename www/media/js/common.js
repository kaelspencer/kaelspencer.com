$(function(){
    $("#footer-to-top").click(function(){
        $("html, body").animate({ scrollTop: 0 }, 600);
        return false;
    });

    $.ajax({
        type: "GET",
        url: "https://api.github.com/users/kaelspencer/repos",
        datatype: "jsonp",
        error: function(data, textstatus, errorthrown) {
            console.log('Error: ' + textstatus);
        },
        success: function(data) {
            var list = $('#gitlist')

            $.each(data, function(index, repo) {
                list = $('<li>')
                    .insertAfter(list)
                    .addClass('sublist')
                    .html('<a href="' + repo.html_url + '">' + repo.name + '</a>');
            });
        }
    });
});
