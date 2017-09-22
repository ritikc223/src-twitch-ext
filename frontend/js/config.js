/// Config Page for Frontend

$("#sortableGames").sortable();
$("#sortableGames").disableSelection();

var authObject = null;
var srcID = null;
var srcName = null;

window.Twitch.ext.onAuthorized(function(auth) {
    authObject = auth;
    // console.log('The JWT that will be passed to the EBS is', authObject.token);
    // console.log('The channel ID is', authObject.channelId);
    $('#saveBtn').prop("disabled", true)
    $("#saveBtn").attr('class', 'btn-disabled');
    $("#searchBtn").prop("disabled", true);
    $("#searchBtn").attr('class', 'btn-disabled');
    // Get previous settings
    $.ajax({
        type: "POST",
        url: "https://extension.xtvaser.xyz/fetch",
        headers: {
            'x-extension-jwt': auth.token,
        },
        dataType: "json",
        data: {},
        success: function(res) {
            savedData = res.data
            if (savedData != null) {
                restorePreviousSettings(savedData)
            }

            $('#saveBtn').prop("disabled", false)
            $("#saveBtn").attr('class', 'btn-warning');
            $("#searchBtn").prop("disabled", false);
            $("#searchBtn").attr('class', 'btn-primary');
        },
        error: function() {
            $('#saveBtn').prop("disabled", false)
            $("#saveBtn").attr('class', 'btn-warning');
            $("#searchBtn").prop("disabled", false);
            $("#searchBtn").attr('class', 'btn-primary');
        }
    });
});

function restorePreviousSettings(savedData) {

    var settings = JSON.parse(savedData.settings)
    var games = JSON.parse(savedData.games)
    srcID = savedData.srcID;
    srcName = savedData.srcName;

    // Restore All Settings
    //$('#panelTheme').val(settings.theme)
    $('#panelTitle').val(settings.title)
    $('#srcName').val(srcName)
    $('#panelTitleBackgroundType').val(settings.panelTitleBackgroundType)
    if (settings.panelTitleBackgroundType == 'image') {
        // Do nothing, only got 1 image atm
    }
    else if (settings.panelTitleBackgroundType == 'solid') {
        spawnSolidColorPicker(settings.panelTitleBackgroundColor1)
    }
    else if (settings.panelTitleBackgroundType == 'vGradient') {
        spawnGradientColorPicker("Top Color", "Bottom Color", settings.panelTitleBackgroundColor1, settings.panelTitleBackgroundColor2)
    }
    else {
        spawnGradientColorPicker("Left Color", "Right Color", settings.panelTitleBackgroundColor1, settings.panelTitleBackgroundColor2)
    }
    $('#panelTitleDividerColor').val(settings.panelTitleDivColor)
    $('#gameTitleDividerColor').val(settings.gameTitleDivColor)
    $('#wrRainbow').prop('checked', settings.wrRainbow == true);
    $('#titleShadow').prop('checked', settings.panelTitleShadow == true);
    $('#panelTitleHeight').val(settings.panelTitleHeight)
    $('#panelTitleFontBold').prop('checked', settings.panelTitleFontBold == true);
    $('#panelTitleFontItalic').prop('checked', settings.panelTitleFontItalic == true);
    $('#panelTitleFontSize').val(settings.panelTitleFontSize)
    $('#panelTitleFontColor').val(settings.panelTitleFontColor)
    $('#panelTitleFont').val(settings.panelTitleFont)
    $('#panelHeaderFontBold').prop('checked', settings.panelHeaderFontBold == true);
    $('#panelHeaderFontItalic').prop('checked', settings.panelHeaderFontItalic == true);
    $('#panelHeaderFontSize').val(settings.panelHeaderFontSize)
    $('#panelHeaderFontColor').val(settings.panelHeaderFontColor)
    $('#panelHeaderFont').val(settings.panelHeaderFont)
    $('#gameTitleFontBold').prop('checked', settings.gameTitleFontBold == true);
    $('#gameTitleFontItalic').prop('checked', settings.gameTitleFontItalic == true);
    $('#gameTitleFontSize').val(settings.gameTitleFontSize)
    $('#gameTitleFontColor').val(settings.gameTitleFontColor)
    $('#gameTitleFont').val(settings.gameTitleFont)
    $('#gameCategoryFontBold').prop('checked', settings.gameCategoryFontBold == true);
    $('#gameCategoryFontItalic').prop('checked', settings.gameCategoryFontItalic == true);
    $('#gameCategoryFontSize').val(settings.gameCategoryFontSize)
    $('#gameCategoryFontColor').val(settings.gameCategoryFontColor)
    $('#gameCategoryFont').val(settings.gameCategoryFont)
    $('#pbFontBold').prop('checked', settings.pbFontBold == true);
    $('#pbFontItalic').prop('checked', settings.pbFontItalic == true);
    $('#pbFontSize').val(settings.pbFontSize)
    $('#pbFontColor').val(settings.pbFontColor)
    $('#pbFont').val(settings.pbFont)

    // Repopulate Game List
    for (var i = 0; i < games.length; i++) {
        var gameName
        var gameID
        var shouldExpand
        for (var k in games[i]) {
            if (k == 'name' && games[i].hasOwnProperty(k)) {
                gameName = games[i][k]
            }
            else if (k == 'id' && games[i].hasOwnProperty(k)) {
                gameID = games[i][k]
            }
            else if (k == 'shouldExpand' && games[i].hasOwnProperty(k)) {
                if (games[i][k] == true) {
                    shouldExpand = 'checked'
                }
                else {
                    shouldExpand = ''
                }
            }
        }
        addGameToList(gameID, gameName, '', shouldExpand)
    }
}

function setError(string) {
    $("#errorDialog").html(
        `<h3>${string}</h3>`
    )
}

function getPersonalBest(url) {
    ajaxCalls.push($.getJSON(url, function(json) {
        game = json.data
        index = gameList.findIndex(x => x.id === game.id)
        gameList[index].name = game.names.international
        addGameToList(game.id, gameList[index].name, '', '')
    }))
}

function addGameToList(gameID, gameName, removeBox, expandBox) {
    $("#sortableGames").append(
        `<li class=ui-state-default>
            <div class="col-19-20">
                Remove
                <input type=checkbox value="${gameID}" class="displayBox" ${removeBox}>
                Initally Expand
                <input type="checkbox" value="ok6qlo1g" class="expandBox" ${expandBox}>
                <input class="gameTitleBox" type="text" value="${gameName}">
            </div>
            <div class="col-1-20">
                <i class="fa fa-bars" aria-hidden="true"></i>
            </div>
            <br class="clear">
        </li>`
    )
}

var gameList = []
var ajaxCalls = []

function populateGameList(json) {

    personalBests = json.data
    for (let pb of personalBests) {
        // Not added yet
        if (gameList.findIndex(x => x.id === pb.run.game) <= -1) {
            gameList.push({
                id: pb.run.game,
                name: null
            })
        }
    }

    // Get the names for all the games we added
    for (let game of gameList) {
        getPersonalBest(`https://www.speedrun.com/api/v1/games/${game.id}`)
    }

    $.when.apply(null, ajaxCalls).done(function() {
        ajaxCalls = []
        // Disable the spinner
        $('.spinnerWrapper').remove();
        $('#saveBtn').prop("disabled", false)
        $("#saveBtn").attr('class', 'btn-warning');
        $("#searchBtn").prop("disabled", false);
        $("#searchBtn").attr('class', 'btn-primary');
    })
}

function getGameList() {
    $.ajax({
        url: "https://www.speedrun.com/api/v1/users/" + srcID + "/personal-bests",
        dataType: "json",
        success: function(data) {
            populateGameList(data)
        }
    });
}

function printResults(json) {
    var data = json.data

    // No name found
    if (data.length <= 0) {
        setError("No one found on Speedrun.com by that name!")
        $("#searchBtn").prop("disabled", false);
        $("#searchBtn").attr('class', 'btn-primary');
        $('.spinnerWrapper').remove();
        return;
    }
    // More than 1 result, not going to handle this, so be more specific please
    else if (data.length > 1) {
        setError("Found too many users by that name, be more specific!")
        $("#searchBtn").prop("disabled", false);
        $("#searchBtn").attr('class', 'btn-primary');
        $('.spinnerWrapper').remove();
        return;
    }

    // K we are fine then, get the ID
    srcID = data[0].id;
    // Populate the game list
    getGameList();
}

function searchForUser(name) {
    $.ajax({
        url: `https://www.speedrun.com/api/v1/users?lookup=${name}`,
        dataType: "json",
        success: function(data) {
            printResults(data)
        }
    });
}

$("#searchBtn").click(function() {
    // Clean Potential Previous State
    $("#sortableGames").html('')
    srcID = null;
    gameList = []
    srcName = $("#srcName").val()

    // Disable the search button temporarily
    $("#searchBtn").prop("disabled", true);
    $("#searchBtn").attr('class', 'btn-disabled');
    $("#saveBtn").attr('class', 'btn-disabled');
    $('#saveBtn').prop("disabled", true)

    $("#gameListingContainer").append(
        `<section class="spinnerWrapper">
          <div class="spinner">
            <i></i>
            <i></i>
            <i></i>
            <i></i>
            <i></i>
            <i></i>
            <i></i>
          </div>
        </section>`
    )
    $("#gamesHeader").html(
        `<h3>Game List (Reorderable and Toggleable)</h3><br>`
    )
    searchForUser($("#srcName").val())
})

$('#panelTitleBackgroundType').change(function() {
    value = $('#panelTitleBackgroundType').val().trim()
    // Clear Container
    $('#colorPickerContainer').html('')

    if (value == 'image') {
        // Do nothing, only got 1 image atm
    }
    else if (value == 'solid') {
        spawnSolidColorPicker('#ffffff')
    }
    else if (value == 'vGradient') {
        spawnGradientColorPicker("Top Color", "Bottom Color", '#ffffff', '#000000')
    }
    else {
        spawnGradientColorPicker("Left Color", "Right Color", '#ffffff', '#000000')
    }
})

function spawnSolidColorPicker(color1) {
    $('#colorPickerContainer').append(
        `<div>
            Panel Title Background Color
            <input type="color" value="${color1}" id="solidBackgroundColor">
        </div>`
    )
}
function spawnGradientColorPicker(label1, label2, color1, color2) {
    $('#colorPickerContainer').append(
        `<div>
            ${label1}
            <input type="color" value="${color1}" id="gradientColor1">
        </div>
        <div>
            ${label2}
            <input type="color" value="${color2}" id="gradientColor2">
        </div>`
    )
}

$("#saveBtn").click(function() {

    // Check to see if we can actually save or not
    if (gameList == []) {
        setError("ERROR: There are no Games Selected!")
        $("#searchBtn").prop("disabled", false);
        $("#searchBtn").attr('class', 'btn-primary');
        $('.spinnerWrapper').remove();
        return;
    }
    if (srcID == null) {
        setError("ERROR: No Speedrun.com Name Choosen")
        $("#searchBtn").prop("disabled", false);
        $("#searchBtn").attr('class', 'btn-primary');
        $('.spinnerWrapper').remove();
        return;
    }
    if ($('#panelTitle').val() == "") {
        setError("ERROR: No title given to panel!")
        $("#searchBtn").prop("disabled", false);
        $("#searchBtn").attr('class', 'btn-primary');
        $('.spinnerWrapper').remove();
        return;
    }
    $("#errorDialog").html('')

    settings = {}
    settings.theme = "stub"//$('#panelTheme').val()
    settings.title = $('#panelTitle').val()
    // panel title background
    settings.panelTitleDivColor = $('#panelTitleDividerColor').val()
    settings.gameTitleDivColor = $('#gameTitleDividerColor').val()
    // wr cycling
    settings.wrRainbow = $('#wrRainbow').is(':checked')
    settings.panelTitleShadow = $('#titleShadow').is(':checked')
    // height of panel title
    settings.panelTitleHeight = $('#panelTitleHeight').val()
    titleBackgroundType = $('#panelTitleBackgroundType').val().trim()
    if (titleBackgroundType == 'solid') {
        settings.panelTitleBackgroundType = 'solid'
        settings.panelTitleBackgroundColor1 = $('#solidBackgroundColor').val()
    }
    else if (titleBackgroundType == 'vGradient') {
        settings.panelTitleBackgroundType = 'vGradient'
        settings.panelTitleBackgroundColor1 = $('#gradientColor1').val()
        settings.panelTitleBackgroundColor2 = $('#gradientColor2').val()
    }
    else if (titleBackgroundType == 'hGradient') {
        settings.panelTitleBackgroundType = 'hGradient'
        settings.panelTitleBackgroundColor1 = $('#gradientColor1').val()
        settings.panelTitleBackgroundColor2 = $('#gradientColor2').val()
    }
    else {
        settings.panelTitleBackgroundType = 'image'
    }
    // Panel Title Font
    settings.panelTitleFontBold = $('#panelTitleFontBold').is(':checked')
    settings.panelTitleFontItalic = $('#panelTitleFontItalic').is(':checked')
    settings.panelTitleFontSize = $('#panelTitleFontSize').val()
    settings.panelTitleFontColor = $('#panelTitleFontColor').val()
    settings.panelTitleFont = $('#panelTitleFont').val()
    // Panel Header Font
    settings.panelHeaderFontBold = $('#panelHeaderFontBold').is(':checked')
    settings.panelHeaderFontItalic = $('#panelHeaderFontItalic').is(':checked')
    settings.panelHeaderFontSize = $('#panelHeaderFontSize').val()
    settings.panelHeaderFontColor = $('#panelHeaderFontColor').val()
    settings.panelHeaderFont = $('#panelHeaderFont').val()
    // Game Title Font
    settings.gameTitleFontBold = $('#gameTitleFontBold').is(':checked')
    settings.gameTitleFontItalic = $('#gameTitleFontItalic').is(':checked')
    settings.gameTitleFontSize = $('#gameTitleFontSize').val()
    settings.gameTitleFontColor = $('#gameTitleFontColor').val()
    settings.gameTitleFont = $('#gameTitleFont').val()
    // Game Category Font
    settings.gameCategoryFontBold = $('#gameCategoryFontBold').is(':checked')
    settings.gameCategoryFontItalic = $('#gameCategoryFontItalic').is(':checked')
    settings.gameCategoryFontSize = $('#gameCategoryFontSize').val()
    settings.gameCategoryFontColor = $('#gameCategoryFontColor').val()
    settings.gameCategoryFont = $('#gameCategoryFont').val()
    // PB Info Font
    settings.pbFontBold = $('#pbFontBold').is(':checked')
    settings.pbFontItalic = $('#pbFontItalic').is(':checked')
    settings.pbFontSize = $('#pbFontSize').val()
    settings.pbFontColor = $('#pbFontColor').val()
    settings.pbFont = $('#pbFont').val()

    gamesToSend = []
    $('#sortableGames', function() {
        $(this).find('li').each(function() {
            game = {}
            var currentListItem = $(this)
            var checkbox = currentListItem.find('.displayBox')
            if (checkbox.is(':checked') == false) {
                // Then we will add the game
                gamesToSend.push({
                    name: currentListItem.find('.gameTitleBox').val().trim(),
                    id: checkbox.val().trim(),
                    shouldExpand: currentListItem.find('.expandBox').is(':checked')
                })
            }
        })
        // Re have all results
        sendResult(gamesToSend, settings)
    });

});

function sendResult(gamesToSend, settings) {
    // TODO remove
    console.log(gamesToSend)
    console.log(settings)

    $.ajax({
        type: "POST",
        url: "https://extension.xtvaser.xyz/save",
        headers: {
            'x-extension-jwt': authObject.token,
        },
        dataType: "json",
        data: {
            settings: JSON.stringify(settings),
            srcID: srcID,
            srcName: srcName,
            games: JSON.stringify(gamesToSend)
        },
        success: function(res) {
            console.log(res)
            if (res.status == 501) {
                setError("Saving Error: Database Error, Contact Extension Developer")
            } else {
                setError("SUCCESS: Saved Successfully!")
            }
        },
        error: function() {
            setError("ERROR: An Unexpected Error Occurred, Contact Extension Developer")
        }
    });
}
