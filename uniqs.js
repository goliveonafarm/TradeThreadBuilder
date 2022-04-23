class AttributeName {
    static attrArray = []
    constructor(attrName) {
        this._attrName = attrName;
        this._attrNickName = attrName;
        AttributeName.attrArray.push(this);
    }
    static resetNickNames(){
        AttributeName.attrArray.forEach(element => {
            element._attrNickName = element._attrName;
        });
    }
    static setAttrNickName(index, string){
        AttributeName.attrArray[index]._attrNickName = string;
    }
}

class BasicAttribute {
    constructor(attributeName, attrFloorMinVal){
        this._attributeName = attributeName;
        this._attrFloorMinVal = attrFloorMinVal;
    }
}

class Attribute extends BasicAttribute{
    constructor(attributeName, attrFloorMinVal, attrFloorMaxVal) {
        super(attributeName, attrFloorMinVal)

        this._attrFloorMaxVal = attrFloorMaxVal;
        this._attrFloorActVal = attrFloorMaxVal;
    }
}

class SkillAttribute extends Attribute {
    constructor(attributeName, classOrTreeNam, attrFloorMinVal, attrFloorMaxVal) {
        super(attributeName, attrFloorMinVal, attrFloorMaxVal)
        this._classOrTreeName = classOrTreeNam;
    }
}

class TwoFieldAttribute extends Attribute {
    constructor(attributeName, attrFloorMinVal, attrFloorMaxVal, attrCeilMinVal, attrCeilMaxVal) {
        super(attributeName, attrFloorMinVal, attrFloorMaxVal)
        this._attrCeilMinVal = attrCeilMinVal;
        this._attrCeilMaxVal = attrCeilMaxVal;
        this._attrCeilActVal = attrCeilMaxVal;
    }
}

class Base {
    static baseArray = [];
    constructor(baseName, itemClass, tier) {
        this._baseName = baseName;
        this._itemClass = itemClass;
        this._tier = tier;
        this._isEth = false;
        this._ed = null;
        Base.baseArray.push(this);
    }
    setEth(boolVal) {
        this._isEth = boolVal;
    }
    setEd(newEd) {
        this._ed = newEd;
        if (Object.hasOwn(this, '_defActVal')) this._defActVal = this._base._baseMaxVal;
    }
}

class Weapon extends Base {
    constructor(baseName, itemClass, tier, minDamage, maxDamage) {
        super(baseName, itemClass, tier)
        this._minDamage = minDamage;
        this._maxDamage = maxDamage;
    }
}

class Armor extends Base {
    constructor(baseName, itemClass, tier, minDef, maxDef) {
        super(baseName, itemClass, tier)
        this._minDef = minDef;
        this._maxDef = maxDef;
        this._defActVal = maxDef;
    }
    getDef() {
        let ethMultiplier = this._isEth ? 1.50 : 1.00;
        if (this._ed === null) return Math.floor(this._defActVal * ethMultiplier);
        return Math.floor((parseFloat((this._defActVal + 1) * ethMultiplier)) * ((parseFloat(this._ed) * 0.01) + 1));
    }
    setDef(newDef) {
        this._defActVal = newDef;
    }
}

class Item {
    constructor(base, ed, arr) {
        this._base = Object.assign({}, base);
        this._base._ed = ed;
        this._arr = arr;
    }
}

class Unique extends Item {
    static uniqueArr = [];
    constructor(base, name, ed, arr) {
        super(base, ed, arr)
        this._name = name;
        Unique.uniqueArr.push(this);
    }
}

//#region attributes
const Sockets = new AttributeName('Sockets');
const Ar = new AttributeName('Attack Rating');
const ArAndED = new AttributeName('Attack Rating - Enhanced Damage');
const Def = new AttributeName('Defense');
const ColdDmg = new AttributeName('Cold Damage');
const FireDmg = new AttributeName('Fire Damage');
const LightDmg = new AttributeName('Lightning Damage');
const PsnDmg = new AttributeName('Poison Damage');
const AllRes = new AttributeName('All Resist');
const ColdRes = new AttributeName('Cold Resist');
const FireRes = new AttributeName('Fire Resist');
const LightRes = new AttributeName('Lightning Resist');
const PsnRes = new AttributeName('Poison Resist');
const EnnhancedDmg = new AttributeName('Enhanced Damage %')
const MaxDmg = new AttributeName('Maximum Damage');
const MinDmg = new AttributeName('Minimum Damage');
const StackSize = new AttributeName('Quantity');
const LightRad = new AttributeName('Light Radius');
const MagicFind = new AttributeName('Magic Find %');
const GoldFind = new Attribute('Gold Find %')
const Mana = new AttributeName('Mana');
const DmgToMana = new AttributeName('Damage Taken Goes to Mana %');
const ManaOnKill = new AttributeName('Mana After Each Kill');
const AllSkills = new AttributeName('All Skills');
const Skills = new AttributeName('Skills');
const ClassSkills = new AttributeName('Class Skills');
const ClassSkillTree = new AttributeName('Class Skill Tree');
const FCR = new AttributeName('Faster Cast Rate');
const BlockAndFasterBlock = new AttributeName('Chance of Blocking - Faster Block Rate');
const FHR = new AttributeName('Faster Hit Recovery');
const IAS = new AttributeName('Increased Attack Speed')
const DmgReduce = new AttributeName('Damage Reduced by');
const MageDmgReduce = new AttributeName('Magic Damage Reduced by');
const RunWalk = new AttributeName('Faster Run/Walk %');
const LifeSteal = new AttributeName('Life Stoeln per Hit %');
const ManaSteal = new AttributeName('Mana Stoeln per Hit %');
const ReplLife = new AttributeName('Replenish Life');
const Dex = new AttributeName('Dexterity');
const Energy = new AttributeName('Energy');
const Life = new AttributeName('Life');
const Str = new AttributeName('Strength');
//#endregion
//#region useless AttributeNames?
const HitFlee = new AttributeName('Hit causes Monster to Flee');
const MaxStam = new AttributeName('Maximum Stamina');
const IgnoreTgtDef = new AttributeName('Ignore Target Defense');
const Knockback = new AttributeName('Knockback');
const PrevMnstHeal = new AttributeName('Prevent Monster Heal');
const AttackerTakesDmg = new AttributeName('Attacker Takes Damage of');
const Repair = new AttributeName('Repairs 1 duarbility in seconds x');
const PsnLength = new AttributeName('Poison Length Reduced by %');
const LevelRequirement = new AttributeName('Level Requirement');
//#endregion
//#region  Armors
const DuskShroud = new Armor('Dusk Shroud', 'Armor', 'Elite', 361, 467);
const OrmusRobes = new Unique(DuskShroud, 'Orumus Robes\'', null,
    [
        new Attribute(Ar, 10, 15),
        new Attribute(Ar, 10, 15),
        new TwoFieldAttribute(ArAndED, 10, 20, 300, 200),
        new SkillAttribute(ClassSkills, 'Druid', 1, 2)
    ]);
const WireFleece = new Armor('Wire Fleece', 'Armor', 'Elite', 364, 470);
const GladiatorsBane = new Unique(WireFleece, 'The Gladiator\'s Bane', null,
    [
        new Attribute(Ar, 10, 20)
    ]);
const OrgreAxe = new Weapon('Ogre Axe', 'PoleArm', 'Elite', 28, 145);
const Bonehew = new Unique(OrgreAxe, 'Bonehew', 320,
    [
        new Attribute(Ar, 10, 20)
    ]);
const Ring = new Base('Ring', 'Jewelry', null);
const Soj = new Unique(Ring, 'Stone of the Jordan', null,
    [
        new Attribute(Ar, 10, 20)
    ]);


//#endregion

export {
    AttributeName, Base, Unique
}