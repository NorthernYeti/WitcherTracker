var Location = {
    None: 0,
    HeadLocation: 1,
    TorsoLocation: 2,
    RightArmLocation: 3,
    LeftArmLocation: 4,
    RightLegLocation: 5,
    LeftLegLocation: 6,
    TailWing: 7
};

var CritType = {
    Simple: 1,
    Complex: 2,
    Difficult: 3,
    Deadly: 4
};

var Outcome = {
    Miss: 1,
    Hit: 2,
    Critical: 3
};

let combatant_count = 0;

$(function () {
    $("#fight").on("click", function(){
        PrepareFight();
    });

    $("#add").on("click", function(){
        AddCombatant();
    });
});

function PrepareFight(){
    if(attacker === undefined || defender === undefined){
        alert('Pick attacker and defender');
        return;
    }

    let attack_bonus =  GetNumbericValue(attacker.find('input[name="abonus"]'));
    let defence_bonus =  GetNumbericValue(defender.find('input[name="dbonus"]'));
    let armour = GetNumbericValue(defender.find('input[name="armor"]'));
    let location = GetNumbericValue($("#hit_location").val());

    let outcome;
    
    try {
        outcome = Fight(attack_bonus, defence_bonus, armour, location);
    } 
    catch (error) {
        console.error(error);
    }  

    let $output = $("#output");
    
    if(outcome.outcome === Outcome.Miss)
        $output.text(`Miss! ${MissDescriptions[Math.floor(Math.random() * MissDescriptions.length)]}`);
    else if(outcome.damage > 0 ){
        let hp = GetNumbericValue(defender.find('input[name="hp"]'));
        defender.find('input[name="armor"]').val(armour - 1);
        defender.find('input[name="hp"]').val(hp - outcome.damage);
        $output.text(`Hit! ${outcome.damage} to ${outcome.location} on a ${outcome.attack_roll} roll.`);
    }else{
        $output.text(`Hit! No damage.`);
    }
}

function Fight(attackBonus, defenceBonus, armor, selectedLocation){

    let locationDetails = undefined;
    let mod = 0;
    let damage = 0;
    let critType = undefined;
    let description = "";

    //Roll attack and defence
    let attack = rollExplodingDice(false);
    let defence = rollExplodingDice(false);

    // Apply Skill and Mods
    if(selectedLocation !== Location.None && selectedLocation !== undefined){
        locationDetails = GetHitLocationValues(selectedLocation);
        mod = mod + locationDetails.Penalty;
    }

    let difference = (attack + attackBonus + mod) - (defence + defenceBonus);

    //Is Attack above Defence?
    if(difference <= 0){
        return {
            outcome: Outcome.Miss,
        }
    }

    //Critical hit check
    if(difference > 7){
        // let critical = ProcessCritical(difference, location)
        // damage += critical.damage;
        // location = critical.location;
    }

    //Roll Weapon Damage
    damage += RollWeaponDamage();

    //Apply modifiers

    //Determine hit location
    if(locationDetails === undefined){
        selected = DetermineRandomHumanHitLocation();
        locationDetails = GetHitLocationValues(selected);
    }

    //Determine total damage
    if(armor !== undefined)
        damage = damage - armor;
    
    damage = Math.floor(damage * locationDetails.Damage);

    //At least 1 damage done
    return {
        outcome: Outcome.Hit,
        damage: damage,
        location: locationDetails.Location,
        attack_roll: attack
    }
}

function rollExplodingDice(explodingDown){
    let x = rollDice("1d10").sum;

    if(x == 1){
        if(explodingDown == true){
            return 1;
        }else{
            return -1 * rollExplodingDice(true);
        }
    }else if (x == 10){
        return x + rollExplodingDice(false);
    }

    return x;
}

function RollWeaponDamage(){
    let damage = $("#damage").val();
    let roll = rollDice(damage).sum;
    return roll;
}

function GetHitLocationValues(selected) {
    switch (selected) {
        case Location.HeadLocation:
            return {
                Location: selected,
                Penalty: -6,
                Damage: 3
            };
        case Location.TorsoLocation:
            return {
                Location: selected,
                Penalty: -1,
                Damage: 1
            };
        case Location.RightArmLocation:
            return {
                Location: selected,
                Penalty: -3,
                Damage: 0.5
            };
        case Location.LeftArmLocation:
            return {
                Location: selected,
                Penalty: -3,
                Damage: 0.5
            };
        case Location.RightLegLocation:
            return {
                Location: selected,
                Penalty: -2,
                Damage: 0.5
            };
        case Location.LeftLegLocation:
            return {
                Location: selected,
                Penalty: -2,
                Damage: 0.5
            };
    }
}

function DetermineRandomHumanHitLocation() {
    let randomLocation = rollDice("1d10").sum;
    switch (randomLocation) {
        case 1:
            return Location.HeadLocation;
        case 2:
        case 3:
        case 4:
            return Location.TorsoLocation;
        case 5:
            return Location.RightArmLocation;
        case 6:
            return Location.LeftArmLocation;
        case 7:
        case 8:
            return Location.RightLegLocation;
        case 9:
        case 10:
            return Location.LeftLegLocation;
        default:
            return Location.TorsoLocation;
    }
}

function DetermineRandomCritLocation() {
    let randomLocation = rollDice("2d6").sum;
    switch (randomLocation) {
        case 2:
            return LeftLegLocation;
        case 3:
            return RightLegLocation;
        case 4:
            return LeftArmLocation;
        case 5:
            return RightArmLocation;
        case 6:
        case 7:
        case 8:
        case 9:
        case 10:
            return TorsoLocation;
        case 11:
        case 12:
            return HeadLocation;
        default:
            return TorsoLocation;
    }
}

function GetNumbericValue(field){
    let $value = $(field).val();

    if($value === undefined || $value === "") return 0;

    let parsed = parseInt($value, 10);

    if (parsed === NaN) return 0;

    return parsed;
}

function ProcessCritical(difference, location){

    let damage = 0;
    let critType;

    if(difference >= 15){
        damage += 10;
        critType = CritType.Deadly;
    }else if(difference >= 13){
        damage += 8;
        critType = CritType.Difficult;
    }else if(difference >= 10){
        damage += 5;
        critType = CritType.Complex;
    }else if(difference >= 7){
        damage += 3;
        critType = CritType.Simple;
    }

    if(location === undefined){
        location = DetermineRandomCritLocation();
    }

    return {
        damage: damage,
        critType: critType,
        location: location,
        description: GetCritDescription(location, critType)
    }
}

function GetCritDescription(location, critType){
    return "Ouch, that hurt!";
}

function AddCombatant(){
    combatant_count++;
    let html = $('#combatant_template').html();
    let id = `combatant_${combatant_count}`;
    $('#combatants').append(`<div id="${id}" class="col-2">${html}</div>`);
    
    let $combatent = $(`#${id}`);

    let name = $("#name").val();
    $combatent.find('legend').text(name)

    $combatent.on("click", function(){
        SelectCombatant($(this));
    });
}

let attacker = undefined;
let defender = undefined;

function SelectCombatant(element){
    
    if(attacker === undefined){
        attacker = element;
        element.css("background-color", "green");
    }
    else if(defender === undefined){
        defender = element;
        element.css("background-color", "red");
    }
    else{
        defender.css("background-color", "");
        attacker.css("background-color", "");
        attacker = element;
        element.css("background-color", "green");
        defender = undefined;
    }
}

var MissDescriptions = [
    "The blade glances off the enemy's armor, the sound of metal on metal echoing faintly.",
    "Your attack sails wide, landing harmlessly on the floor.",
    "The enemy dodges the attack with a swift movement, the blade passing just inches away.",
    "The attack is blocked, the force of the blow absorbed by the enemy's shield.",
    "The attack hits the wall, rebounding off the surface.",
    "Your attempt is blocked by the enemy's shield.",
    "Your attack is parried, bouncing harmlessly off the enemy's weapon."
]