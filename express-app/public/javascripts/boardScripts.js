//**** ready for render boards and takes you to home page with 

$('document').ready(function() {
    renderExistingBoards();
   
    $('#boardButton').on('click', function() {
        var boardName = prompt('New board name');
        var id = saveBoard({name: boardName}); 
        drawBoard(id, boardName);  
    });
});


//**** render Boards


function renderExistingBoards() {
    $.ajax({
            method: "GET",
            url: "http://localhost:8080/boards",

        })
        .done(function(boards) {
            console.log(boards);

            for (var i = 0; i < boards.length; i++) {
                var board = boards[i];
                drawBoard(board.id, board.name);

                
                //**** Get swimlanes by boardID How reference from scripts.js

                // renderExistingSwimlanes(board.id);
            }
        });
}

//**** get New Id for swimlane

function getNewId(){
    var date = new Date();
    var id = date.getTime();

    console.log(id);

    return id;
}


//***function drawBoard

function drawBoard(id, name) {
    var newBoard = $('<div id="' + id +'" class="board"></div>');
    newBoard.on('click', function() {
        // ***send the user to the swimlane page for this board
     	window.location.href = "/swimlanes?id=" + id;
     });

    newBoard.draggable({
        start: function() {
            $(this).css("zIndex", 100);
        }
    });
    newBoard.droppable({
        drop: function(event, ui) {
            var otherBoard = ui.draggable;
            var thisBoard = $(this);

            otherBoard.detach();
            otherBoard.insertAfter(thisBoard);
            otherBoard.css("zIndex", 0);
        }
    });


    var boardHeader = $('<div class="boardHeader">' + name + '</div>');

    newBoard.append(boardHeader);
  
    var buttons = $('<div class="buttons"><i class="fas fa-trash-alt icons"></i><i class="fas fa-pencil-alt icons"></i></div>');

    newBoard.append(buttons);

    buttons.on('click', '.fa-trash-alt', function() {
        $(this).closest('.board').remove();

    });

    buttons.on('click', '.fa-pencil-alt', function() {
      var newName = prompt('New board name');
      boardHeader.text(newName);  
      updateBoard(id,newName);
    });

    // buttons.on('click', '.fa-plus', function() {
    //     var swimlaneHeader = prompt('New swimlane name');
    //     var swimlaneDescription = prompt('New swimlane description');
    //     var swimlaneId = getNewId();
    //     //****drawSwimlaneDescription(id, SwimlaneDescription); 
    //     drawSwimlane(id, swimlaneHeader, swimlaneId);
    //      //save description function needed   
    //     saveSwimlane({id: swimlaneId, boardId: id, name: swimlaneHeader});
    //  })

    $('#boards').append(newBoard);
}

//***function to save Board

function saveBoard(board) {
    $.ajax({
            method: "POST",
            url: "http://localhost:8080/boards",
            data: board
        })
        .done(function(board) {
            alert("Board Saved: " + board.id);
            return board.id;
        });
}

//****function to update Board****

function updateBoard(id, name) {
  $.ajax({
            method: "POST",
            url: "http://localhost:8080/boards/" + id,
            data: {name: name}
        })
        .done(function(board) {
            alert("Board Update: " + board);
        });  
}