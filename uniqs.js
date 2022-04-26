//#region attributename class

export class AttributeName {
    static attrArray = []
    constructor(attrName) {
        this._attrName = attrName;
        this._attrNickName = attrName;
        AttributeName.attrArray.push(this);
    }
    static resetNickNames() {
        this.attrArray.forEach(element => {
            element._attrNickName = element._attrName;
        });
    }
    static setAttrNickName(index, string) {
        this.attrArray[index]._attrNickName = string;
    }
    static updateValues(newAttributeArray) {
        AttributeName.attrArray.forEach(element => {
            let index = AttributeName.attrArray.indexOf(element);
            element._attrNickName = newAttributeArray[index]._attrNickName;
        })
        console.log("updateValues() successful");
    }
    get attrNickName() { return this._attrNickName; }
    set attrNickName(newNick) { this._attrNickName = newNick; }
    get attrName() { return this._attrName; }
}
//#endregion
//#region Attribute class
export class BasicAttribute {
    constructor(attributeName, attrFloorMaxVal) {
        this._attributeName = attributeName;
        this._attrFloorActVal = attrFloorMaxVal;
        this._attrType = 'basic'
    }
    get attributeName() { return this._attributeName; }
    set attributeName(attributeName) { this._attributeName = attributeName; }
    get attrFloorActVal() { return this._attrFloorActVal }
    set attrFloorActVal(newVal) { this._attrFloorActVal = newVal }
}

export class Attribute extends BasicAttribute {
    constructor(attributeName, attrFloorMinVal, attrFloorMaxVal) {
        super(attributeName, attrFloorMaxVal)
        this._attrFloorMinVal = attrFloorMinVal;
        this._attrFloorMaxVal = attrFloorMaxVal;
        this._attrType = 'attribute'
    }
    get attrFloorMin() { return this._attrFloorMinVal }
    set attrFloorMin(newVal) { this._attrFloorMinVal = newVal }
    get attrFloorMaxVal() { return this._attrFloorMaxVal };
    set attrFloorMaxVal(newVal) { this._attrFloorMaxVal = newVal }
}

export class SkillAttribute extends Attribute {
    constructor(attributeName, classOrTreeName, attrFloorMinVal, attrFloorMaxVal) {
        super(attributeName, attrFloorMinVal, attrFloorMaxVal)
        this._classOrTreeName = classOrTreeName;
        this._attrType = 'skillAttribute'
    }
    get classOrTreeName() { return this._classOrTreeName }
    set classOrTreeName(newVal) { this._classOrTreeName = newVal }
}

export class TwoFieldAttribute extends Attribute {
    constructor(attributeName, attrFloorMinVal, attrFloorMaxVal, attrCeilMinVal, attrCeilMaxVal) {
        super(attributeName, attrFloorMinVal, attrFloorMaxVal)
        this._attrCeilMinVal = attrCeilMinVal;
        this._attrCeilMaxVal = attrCeilMaxVal;
        this._attrCeilActVal = attrCeilMaxVal;
        this._attrType = 'twoFieldAttribute'
    }
    get attrCeilMinVal() { return this._attrCeilMinVal }
    set attrCeilMinVal(newVal) { this._attrCeilMinVal = newVal }
    get attrCeilMaxVal() { return this._attrCeilMaxVal }
    set attrCeilMaxVal(newVal) { this._attrCeilMaxVal = newVal }
    get attrCeilActVal() { return this._attrCeilActVal }
    set attrCeilActVal(newVal) { this._attrCeilActVal = newVal }
}
//#endregion

export class Base {
    static baseArray = [];
    constructor(baseName, itemClass, tier) {
        this._baseName = baseName;
        this._itemClass = itemClass;
        this._tier = tier;
        this._isEth = false;
        this._ed = null;
        this._addedDef = 0;
        this._sockets = 0;
        this._type = 'Jewelry';
        Base.baseArray.push(this);
    }
    get baseName() { return this._baseName; }
    get itemClass() { return this._itemClass; }
    set ed(newEd) {
        if (Object.hasOwn(this, '_defActVal')) this._defActVal = this._maxDef;
        this._ed = newEd;
    }
    get ed() { return this._ed; }
    set isEth(bool) { this._isEth = bool; }
    get isEth() { return this._isEth; }
}

export class Weapon extends Base {
    constructor(baseName, itemClass, tier, minDamage, maxDamage) {
        super(baseName, itemClass, tier)
        this._minDamage = minDamage;
        this._maxDamage = maxDamage;
        this._type = 'Weapon';
    }
    get minDamage() { return this._minDamage }
    get maxDamage() { return this._maxDamage }
}

export class Armor extends Base {
    constructor(baseName, itemClass, tier, minDef, maxDef) {
        super(baseName, itemClass, tier)
        this._minDef = minDef;
        this._maxDef = maxDef;
        this._defActVal = maxDef;
        this._type = 'Armor'
        this.getDef = function () {
            let ethMultiplier = this._isEth ? 1.50 : 1.00;
            if (this._ed === null) return Math.floor(this._defActVal * ethMultiplier);
            return Math.floor((parseFloat((this._defActVal + 1) * ethMultiplier)) * ((parseFloat(this._ed) * 0.01) + 1));
        }
    }
    set defense(newDef) {
        this._defActVal = newDef;
    }
    get defense() {
        let ethMultiplier = this._isEth ? 1.50 : 1.00;
        if (this._ed === null) {
            this._defActVal = Math.floor(this._defActVal * ethMultiplier);
        }
        else { this._defActVal = Math.floor((parseFloat((this._defActVal + 1) * ethMultiplier)) * ((parseFloat(this._ed) * 0.01) + 1)) };
        return this._defActVal;
    }
}

export class Item {
    constructor(base) {
        this._base = base; //JSON.parse(JSON.stringify(base));
        this._arr = [];
        this._name = base._baseName;
        this._magicClass = 'Base';
        this.addAttr = function (attr) {
            let g = attr._attributeName._attrName;
            if (g == '% Enhanced Defense') { this._base._ed = attr._attrFloorActVal }
            if (g == 'Defense') { this._base._addedDef = attr._attrFloorActVal }
            this._arr.push(attr)
        }
    }
    deleteAttribute(index) {
        this._arr.splice(index, 1);
    }
    setEd(newEd) {
        this._base._ed = newEd;
    }
    addAttr(attr) {
        if (attr._attributeName._attrName == '% Enhanced Defense') {
            // this._base._ed = attr._attributeName._attrFloorActVal;
            alert('hit')
            //this._base.setEd(attr._attrFloorActVal);
        }
        this._arr.push(attr)
    }
    getdefense() {
        let ethMultiplier = this.base_._isEth ? 1.50 : 1.00;
        if (this._base._ed === null) return Math.floor(this._base._defActVal * ethMultiplier);
        let f = Math.floor((parseFloat((this._base._defActVal + 1) * ethMultiplier)) * ((parseFloat(this._base._ed) * 0.01) + 1));
    }
}

export class Unique extends Item {
    static uniqueArr = [];
    constructor(base, name, ed) {
        super(base)
        this._name = name;
        this._base._ed = ed;
        this._magicClass = 'Unique';
        Unique.uniqueArr.push(this);
    }
}

//#region attributes
const EnhancedDef = new AttributeName('% Enhanced Defense');
const EnhancedDmg = new AttributeName('% Enhanced Damage');
const Def = new AttributeName('Defense');
const Ar = new AttributeName('Attack Rating');
const ArAndED = new AttributeName('Attack Rating - Enhanced Damage');
const DmgDemon = new AttributeName('Damage to Demons %')
const DefVsMisl = new AttributeName('Defense vs Missiles')
const ColdDmg = new AttributeName('Cold Damage');
const FireDmg = new AttributeName('Fire Damage');
const LightDmg = new AttributeName('Lightning Damage');
const PsnDmg = new AttributeName('Poison Damage');
const AllRes = new AttributeName('All Resist %');
const ColdRes = new AttributeName('Cold Resist %');
const FireRes = new AttributeName('Fire Resist %');
const LightRes = new AttributeName('Lightning Resist %');
const PsnRes = new AttributeName('Poison Resist %');
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
const LifeSteal = new AttributeName('Life Stolen per Hit %');
const ManaSteal = new AttributeName('Mana Stolen per Hit %');
const LifeRegen = new AttributeName('Regenerate Life %');
const ManaRegen = new AttributeName('Regenerate Mana %');
const ReplLife = new AttributeName('Replenish Life');
const Dex = new AttributeName('Dexterity');
const Energy = new AttributeName('Energy');
const Life = new AttributeName('Life');
const Str = new AttributeName('Strength');
const Vit = new AttributeName('Vitality')
const empty = new AttributeName('')
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

const SlayerGuard = new Armor('Slayer Guard', 'Barbarian Helm', 'Exceptional', 93, 120);
const ArreatsFace = new Unique(SlayerGuard, 'Arreat\s Face', null);
ArreatsFace.addAttr(new Attribute(EnhancedDef, 150, 200));
ArreatsFace.addAttr(new Attribute(LifeSteal, 3, 6));
const FuryVisor = new Armor('Fury Visor', 'Barbarian Helm', 'Elite', 105, 150);
const Wolfhowl = new Unique(FuryVisor, 'Wolfhowl', null);
Wolfhowl.addAttr(new Attribute(EnhancedDef, 120, 150));
Wolfhowl.addAttr(new SkillAttribute(empty, 'Warcries', 2, 3));
Wolfhowl.addAttr(new SkillAttribute(empty, 'Feral Rage', 3, 6));
Wolfhowl.addAttr(new SkillAttribute(empty, 'Lycanthropy', 3, 6));
Wolfhowl.addAttr(new SkillAttribute(empty, 'Werewolf', 3, 6));
const DestroyerHelm = new Armor('Destroyer Helm', 'Barbarian Helm', 'Elite', 111, 156);
const DemonhornsEdge = new Unique(DestroyerHelm, 'Demonhorn\'s Edge', null);
DemonhornsEdge.addAttr(new Attribute(EnhancedDef, 120, 150));
DemonhornsEdge.addAttr(new Attribute(LifeSteal, 3, 6));
DemonhornsEdge.addAttr(new Attribute(AttackerTakesDmg, 55, 77));
DemonhornsEdge.addAttr(new SkillAttribute(empty, 'Warcries', 1, 3));
DemonhornsEdge.addAttr(new SkillAttribute(empty, 'Combat Masteries', 1, 3));
DemonhornsEdge.addAttr(new SkillAttribute(empty, 'Combat Skills', 1, 3))
const ConquerorCrown = new Armor('Conqueror Crown', 'Barbarian Helm', 'Elite', 114, 159);
const HalaberdsReign = new Unique(ConquerorCrown, 'Halaberd\'s Reign', 0);
HalaberdsReign.addAttr(new Attribute(ReplLife, 15, 23));
HalaberdsReign.addAttr(new SkillAttribute(empty, 'Battle Command', 1, 2))
HalaberdsReign.addAttr(new SkillAttribute(empty, 'Battle Orders', 1, 2))

const DuskShroud = new Armor('Dusk Shroud', 'Armor', 'Elite', 361, 467);
const OrmusRobes = new Unique(DuskShroud, 'Ormus\' Robes', 0);
OrmusRobes.addAttr(new Attribute(Def, 10, 20));
OrmusRobes.addAttr(new Attribute(ColdDmg, 10, 15));
OrmusRobes.addAttr(new Attribute(FireDmg, 10, 15));
OrmusRobes.addAttr(new Attribute(LightDmg, 10, 15));
OrmusRobes.addAttr(new Attribute(ManaRegen, 10, 15));
const WireFleece = new Armor('Wire Fleece', 'Armor', 'Elite', 364, 470);
const GladiatorsBane = new Unique(WireFleece, 'Gladiator\'s Bane', null);
GladiatorsBane.addAttr(new Attribute(EnhancedDef, 150, 200));
GladiatorsBane.addAttr(new Attribute(DmgReduce, 15, 20));
GladiatorsBane.addAttr(new Attribute(MageDmgReduce, 15, 20));
const BalrogSkin = new Armor('Balrog Skin', 'Armor', 'Elite', 410, 517);
const ArkainesValor = new Unique(BalrogSkin, 'Arkaine\'s Valor', null);
ArkainesValor.addAttr(new Attribute(EnhancedDef, 150, 180));
ArkainesValor.addAttr(new Attribute(Skills, 1, 2));
ArkainesValor.addAttr(new Attribute(DmgReduce, 10, 15));
const ShadowPlate = new Armor('Shadow Plate', 'Armor', 'Elite', 446, 557);
const SteelCarapace = new Unique(ShadowPlate, 'Steel Carapace', null);
SteelCarapace.addAttr(new Attribute(EnhancedDef, 190, 220));
SteelCarapace.addAttr(new Attribute(ManaRegen, 10, 15));
SteelCarapace.addAttr(new Attribute(ColdRes, 40, 60));
SteelCarapace.addAttr(new Attribute(DmgReduce, 9, 14));
const SacredArmor = new Armor('Sacred Armor', 'Armor', 'Elite', 487, 600);
const TemplarsMight = new Unique(SacredArmor, 'Templar\'s Might', null);
TemplarsMight.addAttr(new Attribute(EnhancedDef, 170, 220));
TemplarsMight.addAttr(new Attribute(DefVsMisl, 250, 300));
TemplarsMight.addAttr(new Attribute(Str, 10, 15));
TemplarsMight.addAttr(new Attribute(Vit, 10, 15));
TemplarsMight.addAttr(new Attribute(MaxStam, 40, 50));
TemplarsMight.addAttr(new SkillAttribute(ClassSkillTree, 'Offensive Auras', 1, 2))
const TyraelsMight = new Unique(SacredArmor, 'Tyrael\'s Might', null);
TyraelsMight.addAttr(new Attribute(EnhancedDef, 120, 150));
TyraelsMight.addAttr(new Attribute(DmgDemon, 50, 100));
TyraelsMight.addAttr(new Attribute(Str, 20, 30));
TyraelsMight.addAttr(new Attribute(AllRes, 20, 30));