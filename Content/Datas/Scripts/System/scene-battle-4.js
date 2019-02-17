/*
    RPG Paper Maker Copyright (C) 2017-2019 Marie Laporte

    This file is part of RPG Paper Maker.

    RPG Paper Maker is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    RPG Paper Maker is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Foobar.  If not, see <http://www.gnu.org/licenses/>.
*/

// -------------------------------------------------------
//
//  CLASS SceneBattle
//
//  Step 4 : End of battle
//      SubStep 0 : Victory message
//      SubStep 1 : Experience update
//      SubStep 2 : Level up
//      SubStep 3 : End transition
//
// -------------------------------------------------------

SceneBattle.prototype.initializeStep4 = function(){
    var i, l, battler;
    this.windowTopInformations.content = new GraphicText("Victory!");

    // Heroes
    for (i = 0, l = $game.teamHeroes.length; i < l; i++) {
        battler = this.battlers[CharacterKind.Hero][i];
        battler.setVictory();
        battler.character.totalRemainingXP = this.xp;
    }

    // Check in order to have the right icons size quickly
    this.graphicRewardTop.checkIcons();

    // Time progression settings
    this.time = new Date().getTime();
    this.finishedXP = false;
    this.user = null;
    this.priorityIndex = 0;

    // Music
    EventCommandPlayMusic.playSong($datasGame.battleSystem.battleVictory,
        SongKind.Music);
};

// -------------------------------------------------------

SceneBattle.prototype.updateTeamXP = function() {
    var i, l, character, y, h;
    this.finishedXP = true;
    for (i = this.priorityIndex, l = $game.teamHeroes.length; i < l; i++) {
        character = this.battlers[CharacterKind.Hero][i].character;
        if (!character.isExperienceUpdated()) {
            if (character.updateExperience()) { // Level up
                this.user = character;
                this.user.levelingUp = true;
                this.finishedXP = false;
                this.windowExperienceProgression.content.updateExperience();
                this.priorityIndex = i + 1 % $game.teamHeroes.length;
                this.pauseTeamXP();
                this.finishedXP = false;
                this.user.stepLevelUp = 0;
                this.windowStatisticProgression.content = new
                    GraphicStatisticProgression(this.user);
                y = 90 + (i * 90);
                h = this.windowStatisticProgression.content.getHeight() + RPM
                    .HUGE_PADDING_BOX[0] + RPM.HUGE_PADDING_BOX[2];
                if (y + h > $canvasHeight - 10) {
                    y = $canvasHeight - h - 10;
                }
                this.windowStatisticProgression.setY(y);
                this.windowStatisticProgression.setH(h);
                $datasGame.battleSystem.battleLevelUp.play();
                this.subStep = 2;
                return;
            }
            this.finishedXP = false;
        }
    }

    this.windowExperienceProgression.content.updateExperience();
    this.priorityIndex = 0;
};

// -------------------------------------------------------

SceneBattle.prototype.pauseTeamXP = function() {
    for (var i = 0, l = $game.teamHeroes.length; i < l; i++) {
        this.battlers[CharacterKind.Hero][i].character.pauseExperience();
    }

};

// -------------------------------------------------------

SceneBattle.prototype.unpauseTeamXP = function() {
    for (var i = 0, l = $game.teamHeroes.length; i < l; i++) {
        this.battlers[CharacterKind.Hero][i].character.unpauseExperience();
    }
    this.user.updateRemainingXP(SceneBattle.TIME_PROGRESSION_XP);
};

// -------------------------------------------------------

SceneBattle.prototype.playMapMusic = function()  {
    EventCommandPlayMusic.playSong(EventCommandPlayMusic.previousMusicStopped,
        SongKind.Music, EventCommandPlayMusic.previousMusicStoppedTime, false,
        0);
    $songsManager.initializeProgressionMusic(0, EventCommandPlayMusic
        .previousMusicStopped.volume, 0, SceneBattle.TIME_LINEAR_MUSIC_START);
}

// -------------------------------------------------------

SceneBattle.prototype.updateStep4 = function() {
    switch (this.subStep) {
    case 0:
        if (new Date().getTime() - this.time >= SceneBattle.TIME_END_WAIT) {
            this.time = new Date().getTime();
            this.windowTopInformations.content = this.graphicRewardTop;
            for (var i = 0, l = $game.teamHeroes.length; i < l; i++) {
                this.battlers[CharacterKind.Hero][i].character.updateRemainingXP(
                    SceneBattle.TIME_PROGRESSION_XP);
            }
            $requestPaintHUD = true;
            this.subStep = 1;
        }
        break;
    case 1:
        this.updateTeamXP();
        $requestPaintHUD = true;
        break;
    case 2:
        break;
    case 3:
        $requestPaintHUD = true;
        if ($songsManager.updateProgressionMusic() && this.transitionEnded) {
            this.win();
        }

        // Transition zoom
        if (this.transitionEnd === 2) {
            if (!this.transitionZoom) {
                this.camera.distance -= 5;
                if (this.camera.distance <= 10) {
                    this.camera.distance = 10;
                    this.transitionZoom = true;
                    $gameStack.topMinusOne().updateBackgroundColor();
                    this.playMapMusic();
                }
                return;
            }
            if (this.sceneMap.camera.distance < this.cameraDistance) {
                this.sceneMap.camera.distance += 5;
                this.sceneMap.camera.update();
                if (this.sceneMap.camera.distance >= this.cameraDistance) {
                    this.sceneMap.camera.distance = this.cameraDistance;
                } else {
                    return;
                }
            }
        }

        // Transition fade
        if (this.transitionEnd === 1) {
            if (!this.transitionColor) {
                this.transitionColorAlpha += SceneBattle.TRANSITION_COLOR_VALUE;
                if (this.transitionColorAlpha >= 1) {
                    this.transitionColorAlpha = 1;
                    this.transitionColor = true;
                    this.timeTransition = new Date().getTime();
                    $gameStack.topMinusOne().updateBackgroundColor();
                }
                return;
            }
            if (new Date().getTime() - this.timeTransition < SceneBattle
                .TRANSITION_COLOR_END_WAIT)
            {
                return;
            } else {
                if (this.timeTransition !== -1) {
                    this.timeTransition = -1;
                    this.playMapMusic();
                }
            }

            if (this.transitionColorAlpha > 0) {
                this.transitionColorAlpha -= SceneBattle.TRANSITION_COLOR_VALUE;
                if (this.transitionColorAlpha <= 0) {
                    this.transitionColorAlpha = 0;
                }
                return;
            }
        }

        this.transitionEnded = true;
        break;
    }
};

// -------------------------------------------------------

SceneBattle.prototype.onKeyPressedStep4 = function(key){
    switch (this.subStep) {
    case 1:
        if (DatasKeyBoard.isKeyEqual(key, $datasGame.keyBoard.menuControls
            .Action))
        {
            if (this.finishedXP) {
                this.transitionEnded = false;
                $songsManager.initializeProgressionMusic(EventCommandPlayMusic
                    .currentPlayingMusic.volume, 0, 0, SceneBattle
                    .TIME_LINEAR_MUSIC_END);
                this.subStep = 3;
            } else { // Pass xp
                for (var i = 0, l = $game.teamHeroes.length; i < l; i++) {
                    var character = this.battlers[CharacterKind.Hero][i].character;
                    character.passExperience();
                    character.updateObtainedExperience();
                }
            }
        }
        break;
    case 2:
        if (DatasKeyBoard.isKeyEqual(key, $datasGame.keyBoard.menuControls
            .Action))
        {
            if (this.user.stepLevelUp === 0) {
                this.user.stepLevelUp = 1;
                this.windowStatisticProgression.content
                    .updateStatisticProgression();
            } else {
                this.user.levelingUp = false;
                this.unpauseTeamXP();
                this.subStep = 1;
            }
            $requestPaintHUD = true;
        }
        break;
    }
};

// -------------------------------------------------------

SceneBattle.prototype.onKeyReleasedStep4 = function(key){

};

// -------------------------------------------------------

SceneBattle.prototype.onKeyPressedRepeatStep4 = function(key){

};

// -------------------------------------------------------

SceneBattle.prototype.onKeyPressedAndRepeatStep4 = function(key){

};

// -------------------------------------------------------

SceneBattle.prototype.drawHUDStep4 = function() {
    if (this.subStep !== 3) {
        this.windowTopInformations.draw();
    }

    switch (this.subStep) {
    case 0:
        break;
    case 1:
        this.windowExperienceProgression.draw();
        break;
    case 2:
        this.windowExperienceProgression.draw();
        this.windowStatisticProgression.draw();
        break;
    case 3:
        // Transition fade
        if (this.transitionEnd === 1) {
            $context.fillStyle = "rgba(" + this.transitionEndColor.red + "," +
                this.transitionEndColor.green + "," + this.transitionEndColor.blue +
                "," + this.transitionColorAlpha + ")";
            $context.fillRect(0, 0, $canvasWidth, $canvasHeight);
        }
        break;
    }
};
