const HeadLocation = "head";
const TorsoLocation = "torse";
const RightArmLocation = "rarm";
const LeftArmLocation = "larm";
const RightLegLocation = "rleg";
const LeftLegLocation = "lleg";

var CritType = {
    Simple: 1,
    Complex: 2,
    Difficult: 3,
    Deadly: 4
};


$(function () {
    $("#fight").on("click", function(){
        Fight(
            GetNumbericValue("#abonus"),
            GetNumbericValue("#dbonus"),
            GetNumbericValue("#armor"),
            $('input[name="hit_location"]:checked').val()
        );
    });
});

function Fight(attackBonus, defenceBonus, armor, selectedLocation){
    let $output = $("#output");

    let locationDetails = undefined;
    let mod = 0;
    let damage = 0;
    let critType = undefined;
    let description = "";

    //Roll attack and defence
    let attack = rollExplodingDice(false);
    let defence = rollExplodingDice(false);

    // Apply Skill and Mods
    if(selectedLocation !== "none" && selectedLocation !== undefined){
        locationDetails = GetHitLocationValues(selectedLocation);
        mod = mod + locationDetails.Penalty;
    }

    let difference = (attack + attackBonus + mod) - (defence + defenceBonus);

    //Is Attack above Defence?
    if(difference <= 0){
        $output.empty();
        $output.text("Miss!");
        return;
    }

    //Critical hit check
    if(difference > 7){
        let critical = ProcessCritical(difference, location)
        damage += critical.damage;
        location = critical.location;
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
    if(damage > 0 ){
        $("#armor").val(armor - 1);
        $("#hp").val(GetNumbericValue("#hp") - damage);
        $output.text(`Hit! ${damage} to ${locationDetails.Location} on a ${attack} roll.`);
    }else{
        $output.text(`Hit! No damage.`);
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
        case HeadLocation:
            return {
                Location: HeadLocation,
                Penalty: -6,
                Damage: 3
            };
        case TorsoLocation:
            return {
                Location: TorsoLocation,
                Penalty: -1,
                Damage: 1
            };
        case RightArmLocation:
            return {
                Location: RightArmLocation,
                Penalty: -3,
                Damage: 0.5
            };
        case LeftArmLocation:
            return {
                Location: LeftArmLocation,
                Penalty: -3,
                Damage: 0.5
            };
        case RightLegLocation:
            return {
                Location: RightLegLocation,
                Penalty: -2,
                Damage: 0.5
            };
        case LeftLegLocation:
            return {
                Location: LeftLegLocation,
                Penalty: -2,
                Damage: 0.5
            };
    }
}

function DetermineRandomHumanHitLocation() {
    let randomLocation = rollDice("1d10").sum;
    switch (randomLocation) {
        case 1:
            return HeadLocation;
        case 2:
        case 3:
        case 4:
            return TorsoLocation;
        case 5:
            return RightArmLocation;
        case 6:
            return LeftArmLocation;
        case 7:
        case 8:
            return RightLegLocation;
        case 9:
        case 10:
            return LeftLegLocation;
        default:
            return TorsoLocation;
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