const grid = document.querySelector('.grid');
const squares = document.querySelectorAll('.square');
const popUp = document.querySelector('.pop-up');
const playerScoreText = document.querySelector('.playerScore');
const computerScoreText = document.querySelector('.computerScore');
const PlayerTimeLeftText = document.querySelector('.player-time');
const turnText = document.querySelector('.turn');

let playerSquares =[];
let computerSquares = [];
let gameStarted =false;
let currentPlayer;
let playerHits =   [0,0,0,0,0,0,0,0,0];
let computerHits = [0,0,0,0,0,0,0,0,0];
let computerTimer;
let preferedIndex
let whoFirstId;
let playerTimerId;
let playerTimeLeft = 4;
let playerTimer;
let intervalTime;
let dropId;

const winningArrays = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
];

//some explanation for the above variables:
//
//winningArrays is the set of squares that would make possible win for the game
// computerHits is an array that record the count number of squares taken by computer in every array of the winningarrays
// playerHits is an array that record the count of squares taken by computer in every array of the winning arrays
// playerSuares and computerSquares push the square index taken by both, will be used for fading them out later 


//read Storage;


function readStorage(){

  if(!localStorage.computerScore){
    localStorage.computerScore = 0;
  }
  
     if(!localStorage.playerScore){
     localStorage.playerScore = 0;
  }
      playerScoreText.textContent = localStorage.playerScore;
     computerScoreText.textContent =  localStorage.computerScore;
  
  }
  
  readStorage();


// sort the best prefered squraes indexes for player turn for a better play.
// first the corners,then the center and the sides is the last ones. this will be used as the third tactic for the computr ply turn

 function sortPreferedIndex() {
    let indexArrays = [[8,0,6,2],[4],[1,7,3,5]]

    //sort each inner array randomly
  
    indexArrays.forEach( arr => arr.sort(function(a, b){return 0.5 - Math.random()}));
  
    preferedIndex = indexArrays[0].concat(indexArrays[1]).concat(indexArrays[2]);
  
    }
  
  sortPreferedIndex();


  // a function for an action to take if the given player turn time (4 sceonds) is over. 
  //The action that will be taken is to dismiss the palyer turn and transfer the play turn to the computer.

  function checkPlayerTimeOver() {
    if(playerTimeLeft <= 0){
      clearInterval(playerTimerId);
      turnText.innerHTML = "<i class=\"fas fa-skull\"></i>";
      PlayerTimeLeftText.textContent = '';
      PlayerTimeLeftText.style.animationIterationCount = "0"
      playerTimeLeft = 4;
      currentPlayer = 2;
      setTimeout(() =>{
        computerTurn()},
        1000) ; 
    }
       
    }

    //player turn time counter

    function playerTimeCounter() {
      PlayerTimeLeftText.style.animationIterationCount = "infinite"

      if(currentPlayer !== 0){
       
      playerTimeLeft--;
      
      PlayerTimeLeftText.textContent = playerTimeLeft;
      checkPlayerTimeOver();}
    }

   
    //stating who will play first at the start of the game

  function whoPlayFirst(){
    popUp.innerHTML =""
    let random = Math.floor(Math.random() *2) +1;
    let display = document.createElement('p');
    display.classList.add('display');
    popUp.appendChild(display);
    

    switch(random){

        
      case 1:
        
        display.innerHTML ="<i class=\"fas fa-user\"></i>";

        currentPlayer = 1;
        break;

        case 2:
           
          display.innerHTML = "<i class=\"fas fa-skull\"></i>";
          currentPlayer = 2;
          break;
    }
    
    
  }
  
  whoFirstId = setInterval(whoPlayFirst, 200)

  // set timeOut to end the the random selection of first player

  setTimeout(() => {
    
    clearInterval(whoFirstId);
    popUp.children[0].style.animation = "fadeIn .5s"
    let display2 = document.createElement('p');
    display2.classList.add('display2');
    popUp.appendChild(display2);
    
    display2.textContent = "Go First"

}
 , 3000);


 // set timeOut to clear the popup and give  the first move to  the first player

 setTimeout(() => {
    popUp.style.visibility = 'hidden';
    
    if(currentPlayer == 1){
      setTimeout(()=> {
        popUp.innerHTML ="";
        PlayerTimeLeftText.style.animationIterationCount = "infinite"
        playerTimerId = setInterval(playerTimeCounter,1000);
        playerTurn()},2000)
    } else if(currentPlayer ==2){
     setTimeout(()=> {
      popUp.innerHTML ="";
      turnText.textContent = "Computer Turn";
      computerTurn()},2100) ;
    }
   }, 3000)


   
   // a function that draw the player turn choices

   function playerTurn(){

    turnText.style.animation ="anim-popoutin 1s"
    turnText.innerHTML = "<i class=\"fas fa-user\"></i>";
    PlayerTimeLeftText.textContent = playerTimeLeft;

    squares.forEach(sq => sq.addEventListener('click', function() {
       if(currentPlayer == 1){
         
        if(!sq.classList.contains('taken')){
          
            sq.classList.add('player', 'taken');
            sq.style.padding = "";
          sq.innerHTML ="<i class=\"fas fa-user card\"></i>"
          clearInterval(playerTimerId);
          playerTimeLeft =4;
          PlayerTimeLeftText.textContent = playerTimeLeft;
          currentPlayer =2;
          playerSquares.push(Number(sq.id))

          for(let i =0; i<winningArrays.length;i++){
            if(winningArrays[i].includes(Number(sq.id))){
              playerHits[i] = playerHits[i]+1;
             
            }
          };

          PlayerTimeLeftText.style.animationIterationCount = "0";
          turnText.style.animation ="";
          turnText.innerHTML = "<i class=\"fas fa-skull\"></i>";

          computerTimer = setTimeout(computerTurn, 1200); 
          PlayerTimeLeftText.textContent= '';
          checkBoard();
          
          if(!gameStarted){
            gameStarted = true;
            setDropInterval()
          }
      }
     }
    } ))

   }



   // a function that draw how the computer would play following three tactics

   function computerTurn() {

    clearInterval(playerTimerId);

     let goToSecond = false;
     let goToThird = false;
     firstTactic();
     secondTactic();
     thirdTactic(); 
     


     function drawComputerTurn(sq){
        
        squares[sq].classList.add('computer', 'taken');
        squares[sq].innerHTML = "<i class=\"fas fa-skull card\"></i>";
        
        computerSquares.push(sq);
        winningArrays.forEach((arr,index) => {
          if(arr.includes(sq)){
            computerHits[index] = computerHits[index]+1
          }
        })

        currentPlayer =1;
        playerTimer= setTimeout(playerTurn,500);
        checkBoard();
        

     }

     // first tactic, look if there is a win possibilty for the computer

     function firstTactic(){

        let finding ;
       
       
        for(let i =0; i< computerHits.length;i++){

            if(computerHits[i] == 2 && playerHits[i] == 0){
                for(let  j = 0 ; j<winningArrays[i].length;j++){
             
                 if(!squares[winningArrays[i][j]].classList.contains('taken')){

                    drawComputerTurn(winningArrays[i][j]);
                    finding = 1;
                    break;
                 }
                }

                break;
            }
        }

        if(finding !== 1){
            goToSecond = true;
          }

      
     }

     // look if there is a win possibility for the player, and cut the path for them

     function secondTactic(){

        let finding;
        if(goToSecond){
          

          for(let i =0; i<playerHits.length;i++){
          
            if(playerHits[i] == 2 && computerHits[i] == 0){
              for(let j =0; j<winningArrays[i].length;j++){
                
                if(!squares[winningArrays[i][j]].classList.contains('taken')){

                    drawComputerTurn(winningArrays[i][j]);
                    break;
                }
                }

                finding =1;
                break;
            }
        }


        if(finding !== 1){
            goToThird = true;
          }
    }}


    // follow the preferedIndex to draw a a selection

    function thirdTactic(){

        if(goToThird){

            for(let i =0;i<preferedIndex.length;i++){
             if(!squares[preferedIndex[i]].classList.contains('taken')){
                drawComputerTurn(preferedIndex[i])
                break;
             }

            }


        }

        
    }

    playerTimeLeft =4;
    PlayerTimeLeftText.style.animationIterationCount = "infinite";
    playerTimerId = setInterval(playerTimeCounter,1000);

   }



   // check if there is a win 

   function checkBoard(){

    let squareOne;
    let squareTwo;
    let squareThree;
    

    function drawEnd(winner){
     
        currentPlayer = 0;
        clearTimeout(computerTimer);
        clearTimeout(playerTimer);
        clearInterval(playerTimerId);
        clearTimeout(dropId);
        
        PlayerTimeLeftText.textContent = "";
        turnText.textContent = "";
        popUp.style.visibility = 'inherit';


        let text = document.createElement('p');
        popUp.appendChild(text);

        switch(winner){
            case 'player':
              scoreStorage('player');
            text.textContent = "You Won!";
            squareOne.style.backgroundColor ="#7cd202";
            squareTwo.style.backgroundColor ="#7cd202";
            squareThree.style.backgroundColor ="#7cd202";
            break;

            case "computer":
              scoreStorage('computer') 
                text.textContent ="You Lost!"
                squareOne.style.backgroundColor ="#E64032";
                squareTwo.style.backgroundColor ="#E64032";
                squareThree.style.backgroundColor ="#E64032";

        }
        
        let btn = document.createElement('button');
        popUp.appendChild(btn);
        btn.classList.add('btn')
        btn.textContent ="Play Again"
        btn.addEventListener('click', () => {
          window.location.reload(true);
        })

    }

    for(let i = 0; i<winningArrays.length;i++){
 
     squareOne = squares[winningArrays[i][0]];
     squareTwo = squares[winningArrays[i][1]];
     squareThree = squares[winningArrays[i][2]];
 
     if(squareOne.classList.contains('player') && 
     squareTwo.classList.contains('player') && 
     squareThree.classList.contains('player') ) {
     
        drawEnd('player')
     } else if (

        squareOne.classList.contains('computer') && 
        squareTwo.classList.contains('computer') && 
        squareThree.classList.contains('computer')
     ){
      
        drawEnd('computer');

     }
    }
}

// dropping(fading out) squares and state how many squares will be faded out

function dropSquares(){

  //decide the number of dropped squares based on the number of squares already taken

  let sumOfTakenSquares = computerSquares.length + playerSquares.length;

 let numDrops;
 
 if(sumOfTakenSquares >=8){
   numDrops = 2; 
 }else {
 numDrops = 1
 }

 console.log(numDrops)

  for(let i = 0; i<numDrops; i++){
    let compSq = computerSquares[0];
    let plaSq = playerSquares[0];
    drop(compSq, 'computer');
    drop(plaSq,"player");

  }




  function drop(sq,hits){
    let sqInner = squares[sq].children[0]
  
    sqInner.classList.add('fade')


    switch(hits){
      case 'player':

        squares[sq].classList.remove('taken', "player")
        winningArrays.forEach((arr,index) => {
          if(arr.includes(sq)){
            playerHits[index] = playerHits[index]-1
          }
        })
        playerSquares.shift();

      break;

      case 'computer':

        squares[sq].classList.remove('taken', "computer")
        winningArrays.forEach((arr,index) => {
          if(arr.includes(sq)){
            computerHits[index] = computerHits[index]-1
          }
        })
        computerSquares.shift()
        break

    }
  

  }

  setDropInterval();

}

function setDropInterval(){

  let sum = computerSquares.length + playerSquares.length;
  console.log(sum)

  if(sum >= 6){
    intervalTime = 2000
  } else if(sum >=4) {
  intervalTime = 3500
  } else {
    intervalTime = 4500;
  }

  

  dropId = setTimeout(dropSquares,intervalTime)

}



//storing scores in local storage

function scoreStorage(winner) {

  switch(winner){
    case 'player':

        localStorage.playerScore = Number(localStorage.playerScore) +1
        playerScoreText.textContent = localStorage.playerScore;
        playerScoreText.style.animation = "anim-popoutin 3s"

    break;

    case 'computer':

        localStorage.computerScore = Number(localStorage.computerScore) +1
        computerScoreText.textContent = localStorage.computerScore;
        computerScoreText.style.animation = "anim-popoutin 3s"

      break;
  }
 }

