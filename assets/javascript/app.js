// Initialize Firebase
let config = {
    apiKey: "AIzaSyCrNG-h1heEjSvZeZk-HLx5znt_EjPM4bA",
    authDomain: "rps-multiplayer-43149.firebaseapp.com",
    databaseURL: "https://rps-multiplayer-43149.firebaseio.com",
    projectId: "rps-multiplayer-43149",
    storageBucket: "rps-multiplayer-43149.appspot.com",
    messagingSenderId: "576847503832"
};

firebase.initializeApp(config);

// Create a variable to reference the database
let database = firebase.database();
let playersRef = database.ref("players");
let restartGameRef = database.ref("restartGame");
var chatRoomRef = database.ref("chat");

let marioWorld = {
    avatars: [{
        name: "Mario",
        image: "assets/images/mario.jpeg"
    },
    {
        name: "Luigi",
        image: "assets/images/luigi.jpeg"
    },   
    {
        name: "Koopa",
        image: "assets/images/koopa.jpeg"
    },
    {
        name: "Toad",
        image: "assets/images/toad.jpeg"
    }],
    findAvatarByProperty: function(property, targetValue) {

        for(let index in marioWorld.avatars){
            let currentAvatar = marioWorld.avatars[index];
            let currentValue = currentAvatar[property];

            if (currentValue === targetValue){
                return currentAvatar;
            }
        }
    },
    removeAvatarByProperty: function(property, targetValue){
        for(let index in marioWorld.avatars){
            let currentAvatar = marioWorld.avatars[index];
            let currentValue = currentAvatar[property];

            if (currentValue === targetValue){
                marioWorld.avatars.splice(index, 1);
                break;
            }
        }
    }
};

let rpsGame = {
    player1: null,
    player2: null,
    isPlayer1: false,
    restartGame: false,
    informationSectionSelector: "#information-section",
    weapons: [{
        name: "rock",
        image: "assets/images/rock_mario.png"
    },
    {
        name: "paper",
        image: "assets/images/paper_mario2.png"
    },
    {
        name: "scissors",
        image: "assets/images/scissors_mario.png"
    }],
    renderDisplayMessage: function(){
        let displayMessageElement = $("#displayMessage");
        if(rpsGame.isPlayer1){
            displayMessageElement.text("Welcome " + rpsGame.player1.name + "! You are Player 1...")
        }
        else if(rpsGame.player2){
            displayMessageElement.text("Welcome " + rpsGame.player2.name + "! You are Player 2...")
        }
    },
    renderGameSection: function(){      
        if(!rpsGame.restartGame){
            rpsGame.renderPlayers();
            rpsGame.renderAvatarsSection();
            rpsGame.renderLoaderSection();
            rpsGame.renderWeaponsSection();
            rpsGame.renderMessageSection();
        }
    },
    renderPlayers: function(){

        let imageUri = "assets/images/question-mark.png";
        let player1SectionSelector = "#player1-section";
        let player2SectionSelector = "#player2-section";
        $(player1SectionSelector).empty();
        $(player2SectionSelector).empty();

        if(rpsGame.player1){
            rpsGame.createAvatarCard(rpsGame.player1, player1SectionSelector);
        }
        else{
            rpsGame.createAvatarCard({name: "Player 1", image: imageUri}, player1SectionSelector);
        }
        if(rpsGame.player2){
            rpsGame.createAvatarCard(rpsGame.player2, player2SectionSelector);
        }
        else{
            rpsGame.createAvatarCard({name: "Player 2", image: imageUri}, player2SectionSelector);
        }
    },
    shouldDisplayWeapons: function(){
        let displayWeaponsSection = false;

        if(rpsGame.playersChosen()){
            if(rpsGame.isPlayer1 && !rpsGame.weaponsChosen(rpsGame.player1)){
                displayWeaponsSection = true;
            }
            // if i'm player2 and I haven't chosen a weapon
            if(!rpsGame.isPlayer1 && !rpsGame.weaponsChosen(rpsGame.player2)){
                displayWeaponsSection = true;
            }
        }

        return displayWeaponsSection;
    },
    renderWeaponsSection: function(){

        let weaponsSectionSelector = "#weapons-section";

        $(weaponsSectionSelector).detach();

        if(rpsGame.shouldDisplayWeapons()){
            let weaponsSectionDiv = $("<div>", {
                id: "weapons-section",
                class: "d-inline"
            })
    
            for(let index in rpsGame.weapons){
        
                let image = rpsGame.weapons[index].image;
                let weapon = rpsGame.weapons[index].name;
        
                let weaponImage = $("<img>", {
                    class: "rounded m-4 d-inline weapon",
                    style: "height: 150px; width: 130px",
                    src: image,
                    "data-weapon-name": weapon
                });
        
                weaponsSectionDiv.append(weaponImage);
            }

            $(rpsGame.informationSectionSelector).append(weaponsSectionDiv);
        }
    },
    renderAvatarsSection: function(){

        let avatarSectionSelector = "#avatar-selection-section";

        $(avatarSectionSelector).empty();

        if(rpsGame.playersChosen()){
            rpsGame.hideSection(avatarSectionSelector);
        }
        else if(rpsGame.isPlayer1 && rpsGame.player1){
            rpsGame.hideSection(avatarSectionSelector);
        }
        else {
            for(let index in marioWorld.avatars){
                let currentAvatar = marioWorld.avatars[index];
                rpsGame.createAvatarCard(currentAvatar, avatarSectionSelector, "avatar");
            }
    
            rpsGame.showSection(avatarSectionSelector);
        }
    },
    renderMessageSection: function(){

        let messageSectionSelector = "#message-section";
        let text = "";
        let displayResults = false;

        if(rpsGame.playersChosen()){
            if(rpsGame.weaponsChosen(rpsGame.player1) && rpsGame.weaponsChosen(rpsGame.player2)){
                text = rpsGame.determineWinner();
                displayResults = true;
            }
            else if (rpsGame.isPlayer1 && rpsGame.weaponsChosen(rpsGame.player1)){
                text = "Waiting on " + rpsGame.player2.name + " to shoot";
            } 
            else if (!rpsGame.isPlayer1 && rpsGame.weaponsChosen(rpsGame.player2)){
                text = "Waiting on " + rpsGame.player1.name + " to shoot";
            } 
            else{
                text = "1-2-3 shoot!";
            }
        }
        else{
            if(!rpsGame.player1){
                text = "Please choose a character!";
            }
            else if(rpsGame.isPlayer1 && !rpsGame.player2){
                text = "Waiting on Player 2 to choose a character"
            }
            else{
                text = "Please choose a character!";
            }
        }

        $(messageSectionSelector).detach();

        let messageSectionDiv = $("<div>", {
            id: "message-section"
        })
        
        let messageText = $("<h1>", {
            class: "flash",
            text: text
        })
        
        $(messageSectionDiv).append(messageText);
        $(rpsGame.informationSectionSelector).append(messageSectionDiv);

        if(displayResults){
            setTimeout(function(){
                $(messageSectionSelector).hide();
                rpsGame.resetPlayerChoice();
             }, 3000);
        }
    },
    shouldDisplayLoader: function(){
        let displayLoader = false;

        if(!rpsGame.playersChosen()){
            displayLoader = true;
        }

        // if one of the players hasn't chosen a weapon
        else if(!rpsGame.weaponsChosen(rpsGame.player1) || !rpsGame.weaponsChosen(rpsGame.player2))
        {
            if (rpsGame.isPlayer1 && rpsGame.weaponsChosen(rpsGame.player1)){
                displayLoader = true;
            }
            else if(!rpsGame.isPlayer1 && rpsGame.weaponsChosen(rpsGame.player2)){
                displayLoader = true;
            }
        }

        return displayLoader;
    },
    renderLoaderSection: function(){

        $(".loader").detach();

        if(rpsGame.shouldDisplayLoader()){
                let loader = $("<div>", {
                    class: "col-6 loader"
                });
                $(rpsGame.informationSectionSelector).append(loader);
        }
    },
    determineWinner: function(){
        
        let results = "";
        let player1Choice = rpsGame.player1.choice;
        let player2Choice = rpsGame.player2.choice;
        let player1Name = rpsGame.player1.name;
        let player2Name = rpsGame.player2.name;

        // player1 win scenarios
        if ((player1Choice === 'paper' && player2Choice == 'rock') || 
            (player1Choice === 'rock' && player2Choice === 'scissors') || 
            (player1Choice === 'scissors' && player2Choice === 'paper')) {

            rpsGame.player1.wins +=1;
            rpsGame.player2.loses +=1;
            results = player1Name + " wins! " + player1Choice + " beats " + player2Choice;
        }
        // player1 loss scenarios
        else if ((player1Choice === 'rock' && player2Choice == 'paper') || 
            (player1Choice === 'scissors' && player2Choice === 'rock') || 
            (player1Choice === 'paper' && player2Choice === 'scissors')) {

                rpsGame.player1.loses +=1;
                rpsGame.player2.wins +=1;
                results = player2Name + " wins! " + player2Choice + " beats " + player1Choice;
        }
        // tie scenarios
        else{
            rpsGame.player1.ties +=1;
            rpsGame.player2.ties +=1;
            results = "Tie! You both chose " + player1Choice;
        }

        rpsGame.restartGame = true;
        restartGameRef.set(rpsGame.restartGame);
        database.ref("players/" + rpsGame.player1.name).update(rpsGame.player1);
        database.ref("players/" +rpsGame.player2.name).update(rpsGame.player2);
 
        return results.toUpperCase();
    },
    createAvatarCard: function(player, htmlSelector, additionalClasses){

        let div = $(htmlSelector);
    
        let card = $("<div>" , {
            class: "card border-secondary mt-5 mx-5 mb-1 d-inline-block p-2 " + additionalClasses,
            style: "max-width: 250px; height: 325px",
            "data-avatar-name": player.name
        });
        let cardHeader = $("<div>" , {
            class: "card-header text-center",
            text: player.name
        });
        let cardBody = $("<div>" , {
            class: "card-body text-secondary p-2"
        });
        let cardImage = $("<img>", {
            class: "img-responsive mt-3",
            src: player.image,
            style: "width: 125px; height: 150px",
        })
        let cardFooter = $("<div>", {
            class: "card-footer bg-transparent border-secondary text-left text-muted p-1 b-0 m-0",
        })

        if(player.wins != undefined && player.loses != undefined && player.ties != undefined){

            if(rpsGame.isPlayer1 && player.playerId === 1){
                card.addClass("border-warning");
            }
            else if(!rpsGame.isPlayer1 && player.playerId === 2){
                card.addClass("border-warning");
            }
            let winsElement = $("<p>", {
                class: "m-0",
                text: "Wins: " + player.wins
            })
            let loseslement = $("<p>", {
                class: "m-0",
                text: "Loses: " + player.loses
            })
            let tiesElement = $("<p>", {
                class: "m-0",
                text: "Ties: " + player.ties
            })
            cardFooter.append(winsElement, loseslement, tiesElement);
        }

        
        card.append(cardHeader, cardImage, cardBody, cardFooter);
        div.append(card);
    },
    hideSection: function(sectionSelector){
        $(sectionSelector).hide();
    },
    showSection: function(sectionSelector){
        $(sectionSelector).show();
    },
    playersChosen(){
        if (rpsGame.player1 && rpsGame.player2){
            return true;
        }
        return false;
    },
    weaponsChosen: function(player){
        let weaponsChosen = false;

        if(player){
            if(player.choice){
                weaponsChosen = true;
            }
        }

        return weaponsChosen;
    },
    resetPlayerChoice: function(){
        if(rpsGame.player1 && rpsGame.player2){
            rpsGame.player1.choice = "";
            rpsGame.player2.choice = "";
        }
        
        database.ref("players/" + rpsGame.player1.name).update(rpsGame.player1);
        database.ref("players/" + rpsGame.player2.name).update(rpsGame.player2);
        rpsGame.restartGame = false;
        restartGameRef.set(rpsGame.restartGame);
    },
    loadPlayerFromDatabase: function(player){

        let playerId = player.playerId;
        let name = player.name;

        if(!rpsGame.playersChosen()){
            marioWorld.removeAvatarByProperty("name", name);
        }
        
        if(playerId === 1){
            rpsGame.player1 = player;
        }
        else{
            rpsGame.player2 = player;
        } 
        
    }, 
    renderChatSection: function(){
        let chatSectionSelector = "#chat-section";
        if(rpsGame.isPlayer1 && rpsGame.player1){
            rpsGame.showSection(chatSectionSelector);
        }
        else if(!rpsGame.isPlayer1 && rpsGame.player2){
            rpsGame.showSection(chatSectionSelector);
        }
    },
    saveChatInput: function(){
      
        let message = $("#chat-input").val();
        let name = "";

        if(rpsGame.isPlayer1 && rpsGame.player1){
            name = rpsGame.player1.name;
        }
        else if(!rpsGame.isPlayer1 && rpsGame.player2){
            name = rpsGame.player2.name;
        }
    
        chatRoomRef.push({
            name: name,
            message: message,
            time: firebase.database.ServerValue.TIMESTAMP
        });
    
        $("#chat-input").val("");
    }
};

$( document ).ready(function() {

    playersRef.on("child_added", function(snapshot) {    
        
        let player = snapshot.val();

        if(player){
            rpsGame.loadPlayerFromDatabase(player);
        }

        rpsGame.renderGameSection();

        rpsGame.renderChatSection();
        
        }, function (errorObject) {
                console.log("The read failed: " + errorObject.code);
    });

    playersRef.on("child_changed", function(snapshot) {    

        let player = snapshot.val();

        rpsGame.loadPlayerFromDatabase(player);

        rpsGame.renderGameSection();
        
        }, function (errorObject) {
                console.log("The read failed: " + errorObject.code);
    });

    restartGameRef.on("value", function(snapshot) {    

        console.log(snapshot.val());
        
        rpsGame.restartGame = snapshot.val();

        rpsGame.renderGameSection();
        
        }, function (errorObject) {
                console.log("The read failed: " + errorObject.code);
    });

    // if no players were retrieved from the database
    if(!rpsGame.player1){
        rpsGame.renderGameSection();
    }

    $("#chat-submit").click(function() {

        event.preventDefault();

        if ($("#chat-input").val() !== "") {
      
            rpsGame.saveChatInput();
        }

      });

      $("#chat-input").keypress(function(e) {

        if (e.which === 13 && $("#chat-input").val() !== "") {
            rpsGame.saveChatInput();
        }
      });

    chatRoomRef.orderByChild("time").on("child_added", function(snapshot) {

        let chatAreaSelector = "#chat-area";

        let messageTextElement = $("<p>", {
            class: "m-1"
        });

        console.log(snapshot.val().name, snapshot.val().message);

        let spanElement = $("<span>", {
            text: snapshot.val().name + ": " + snapshot.val().message
        })

        messageTextElement.append(spanElement);
        $(chatAreaSelector).append(messageTextElement);

        $(chatAreaSelector).scrollTop($(chatAreaSelector)[0].scrollHeight);
    });

    $(document).on("click", ".avatar", function() {
        let value = $(this).attr("data-avatar-name");
        let selectedAvatar = marioWorld.findAvatarByProperty("name", value);

        if(!rpsGame.player1){
            rpsGame.isPlayer1 = true;
            rpsGame.player1 = selectedAvatar;
            rpsGame.player1.playerId = 1;
            rpsGame.player1.wins = 0;
            rpsGame.player1.loses = 0;
            rpsGame.player1.ties = 0;
            rpsGame.player1.choice = "";
            playersRef.child(rpsGame.player1.name).set(rpsGame.player1)
            // On disconnect remove this user's player object
            database.ref("players/" + rpsGame.player1.name).onDisconnect().remove();

        }
        else{
            rpsGame.player2 = selectedAvatar;
            rpsGame.player2.playerId = 2;
            rpsGame.player2.wins = 0;
            rpsGame.player2.loses = 0;
            rpsGame.player2.ties = 0;
            rpsGame.player2.choice = "";
            playersRef.child(rpsGame.player2.name).set(rpsGame.player2)
            // On disconnect remove this user's player object
            database.ref("players/" + rpsGame.player2.name).onDisconnect().remove();

            if(!rpsGame.player1 && !rpsGame.player2){
                chatRoomRef.onDisconnect().remove();
            }
        }

        restartGameRef.set(rpsGame.restartGame);
        
        rpsGame.renderDisplayMessage();

        rpsGame.renderGameSection();

        var audio = new Audio("assets/sounds/mario.wav");
        audio.play()
    })

    $(document).on('click', ".weapon", function() {
        event.preventDefault();

        let weaponName = $(this).attr("data-weapon-name");

        if(rpsGame.isPlayer1){
            rpsGame.player1.choice = weaponName;
            database.ref("players/" + rpsGame.player1.name).update(rpsGame.player1);
        }
        else{
            rpsGame.player2.choice = weaponName
            database.ref("players/" + rpsGame.player2.name).update(rpsGame.player2);
        }
    });
});