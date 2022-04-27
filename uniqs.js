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
    constructor(base, name, ed, addedDef = 0) {
        super(base)
        this._name = name;
        this._base._ed = ed;
        this._base._addedDef = addedDef;
        this._magicClass = 'Unique';
        Unique.uniqueArr.push(this);
    }
}

//#region attributes
const EnhancedDef = new AttributeName('% Enhanced Defense');
const EnhancedDmg = new AttributeName('% Enhanced Damage');
const Def = new AttributeName('Defense');
const Ar = new AttributeName('Attack Rating');
const ArPerc = new AttributeName('Attacking Rating %')
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
const LightAsbInt = new AttributeName('Lightning Absorb');
const ColdAbsorbPerc = new AttributeName('Cold Absorb %');
const EnemyLightResist = new AttributeName ('Enemy Lightning Reist -%');
const EnemyFireResist = new AttributeName('Enemy Fire Resist -%');
const EnemyColdResist = new AttributeName('Enemy Cold Resist');
const EnemyPsnResist = new AttributeName('Enemy Poison Resist -%');
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
const DmgReducePercent = new AttributeName('Damage Reduced by %')
const MageDmgReduce = new AttributeName('Magic Damage Reduced by');
const MageDmgReducePercent = new AttributeName('Magic Damage Reduced by')
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

const Sash = new Armor('Sash', 'Belt', 'Normal', 2, 2);
const LightBelt = new Armor('Light Belt', 'Belt', 'Normal', 3, 3);
const Belt = new Armor('Belt', 'Belt', 'Normal', 5, 5);
const HeavyBelt = new Armor('Heavy Belt', 'Belt', 'Normal', 6, 6);
const GoldWrap = new Unique(HeavyBelt, 'Gold Wrap', null, 25);
GoldWrap.addAttr(new Attribute(EnhancedDef, 40, 60));
GoldWrap.addAttr(new Attribute(GoldFind, 50, 80));
const PlatedBelt = new Armor('Plated Belt', 'Belt', 'Normal', 8, 11);
const DemonhideSash = new Armor('Demonhide Sash', 'Belt', 'Exceptional', 29, 34);
const StringOfEars = new Unique(DemonhideSash, 'String of Ears', null, 15);
StringOfEars.addAttr(new Attribute(EnhancedDef, 150, 180));
StringOfEars.addAttr(new Attribute(LifeSteal, 6, 8));
StringOfEars.addAttr(new Attribute(DmgReducePercent, 10, 15));
StringOfEars.addAttr(new Attribute(MageDmgReduce, 10, 15))
const SharkskinBelt = new Armor('Sharkskin Belt', 'Belt', 'Exceptional', 31, 36);
const Razortail = new Unique(SharkskinBelt, 'Razortail', null, 15)
Razortail.addAttr(new Attribute(EnhancedDef, 120, 150));
const MeshBelt = new Armor('Mesh Belt', 'Belt', 'Exceptional', 35, 40);
const GloomsTrap = new Unique(MeshBelt, 'Gloom\'s Trap', null, 0);
GloomsTrap.addAttr(new Attribute(EnhancedDef, 120, 150));
const BattleBelt = new Armor('Battle Belt', 'Belt', 'Exceptional', 37, 42);
const Snowclash = new Unique(BattleBelt, 'Snowclash', null, 0);
Snowclash.addAttr(new Attribute(EnhancedDef, 130, 170));
const WarBelt = new Armor('War Belt', 'Belt', 'Exceptional', 41, 52);
const Thundergods = new Unique(WarBelt, 'Thundergod\'s Vigor', null, 0);
Thundergods.addAttr(new Attribute(EnhancedDef, 160, 200));
const SpiderwebSash = new Armor('Spiderweb Sash', 'Belt', 'Elite', 55, 62);
const ArachnidMesh = new Unique(SpiderwebSash, 'Arachnid Mesh', null, 0);
ArachnidMesh.addAttr(new Attribute(EnhancedDef, 90, 120));
const VampirefangBelt = new Armor('Vampirefang Belt', 'Belt', 'Elite', 56, 63);
const NosferatusCoil = new Unique(VampirefangBelt, 'Nosferatu\'s Coil', null, 0);
const MithrilCoil = new Armor('Mithril Coil', 'Belt', 'Elite', 58, 65);
const VerdungosHeartyCord = new Unique(MithrilCoil, 'Verdungo\s Heraty Cord', null, 0);
VerdungosHeartyCord.addAttr(new Attribute(EnhancedDef, 90, 140));
VerdungosHeartyCord.addAttr(new Attribute(Vit, 30, 40));
VerdungosHeartyCord.addAttr(new Attribute(ReplLife, 10, 13));
VerdungosHeartyCord.addAttr(new Attribute(MaxStam, 100, 120));
VerdungosHeartyCord.addAttr(new Attribute(DmgReducePercent, 10, 15))

const AncientArmor = new Armor('Ancient Armor', 'Armor', 'Normal', 208, 233);
const SilksOfTheVictor = new Unique(AncientArmor, 'Silks of the Victor', null, 0);
SilksOfTheVictor.addAttr(new Attribute(EnhancedDef, 100, 120));
const Serpentskin = new Armor('Serpentskin Armor', 'Armor', 'Exceptional', 111, 126);
const SkinOfTheViperMagi = new Unique(Serpentskin, 'Skin of the Vipermagi', 120, 0);
SkinOfTheViperMagi.addAttr(new Attribute(MageDmgReduce, 9, 13));
const DemonhideArmor = new Armor('Demonhide Armor', 'Armor', 'Exceptional', 122, 136);
const SkinOfTheFlayedOne = new Unique(DemonhideArmor, 'Skin of the Flayed One', null, 0);
SkinOfTheFlayedOne.addAttr(new Attribute(EnhancedDef, 150, 190));
SkinOfTheFlayedOne.addAttr(new Attribute(LifeSteal, 5, 7));
SkinOfTheFlayedOne.addAttr(new Attribute(ReplLife, 15, 25));
const TrellisedArmor = new Armor('Trellised Armor', 'Armor', 'Exceptional', 138, 153);
const IronPelt = new Unique(TrellisedArmor, 'Iron Pelt', null, 0);
IronPelt.addAttr(new Attribute(EnhancedDef, 50, 100));
IronPelt.addAttr(new Attribute(DmgReduce, 15, 20));
IronPelt.addAttr(new Attribute(MageDmgReduce, 15, 20));
const TigulatedMail = new Armor('Tigulated Mail', 'Armor', 'Exceptional', 176, 190);
const CrowCaw = new Unique(TigulatedMail, 'Crow Caw', null, 0);
CrowCaw.addAttr(new Attribute(EnhancedDef, 150, 180));
const LinkedMail = new Armor('Linked Mail', 'Armor', 'Exceptional', 158, 172);
const SpiritForge = new Unique(LinkedMail, 'Spirit Forge', null, 0);
SpiritForge.addAttr(new Attribute(EnhancedDef, 120, 160));
const Cuirass = new Armor('Cuirass', 'Armor', 'Exceptional', 188, 202);
const DurielsShell = new Unique(Cuirass, 'Duriel\s Shell', null, 0);
DurielsShell.addAttr(new Attribute(EnhancedDef, 160, 200));
const MeshArmor = new Armor('Mesh Armor', 'Armor', 'Exceptional', 198, 213);
const Shaftstop = new Unique(MeshArmor, 'Shaftstop', null, 0);
Shaftstop.addAttr(new Attribute(EnhancedDef, 180, 220));
const RussetArmor = new Armor('Russet Armor', 'Armor', 'Exceptional', 225, 243);
const SkuldersIre = new Unique(RussetArmor, 'Skulder\'s Ire', null, 0);
SkuldersIre.addAttr(new Attribute(EnhancedDef, 160, 200));
const MagePlate = new Armor('Mage Plate', 'Armor', 'Exceptional', 225, 261);
const QueHegans = new Unique(MagePlate, 'Que-Hegan\'s Wisdom', null, 0);
QueHegans.addAttr(new Attribute(EnhancedDef, 140, 160));
QueHegans.addAttr(new Attribute(MageDmgReduce, 6, 10));
const TemplarCoat = new Armor('Templar Coat', 'Armor', 'Exceptional', 252, 274);
const GuardianAngel = new Unique(TemplarCoat, 'Guardian Angel', null, 0);
GuardianAngel.addAttr(new Attribute(EnhancedDef, 180, 200));
const SharktoothArmor = new Armor('Sharktooth Armor', 'Armor', 'Exceptional', 242, 258);
const Toothrow = new Unique(SharktoothArmor, 'Toothrow', null, 0);
Toothrow.addAttr(new Attribute(EnhancedDef, 160, 220));
Toothrow.addAttr(new Attribute(Def, 40, 60));
Toothrow.addAttr(new Attribute(AttackerTakesDmg, 20, 40));
const EmbossedPlate = new Armor('Embossed Plate', 'Armor', 'Exceptional', 282, 303);
const AtmasWail = new Unique(EmbossedPlate, 'Atma\'s Wail', null, 0);
AtmasWail.addAttr(new Attribute(EnhancedDef, 120, 160));
const ChaosArmor = new Armor('Chaos Armor', 'Armor', 'Exceptional', 315, 342);
const BlackHades = new Unique(ChaosArmor, 'Black Hades', null, 0);
BlackHades.addAttr(new Attribute(EnhancedDef, 140, 200));
BlackHades.addAttr(new Attribute(DmgDemon, 30, 60));
BlackHades.addAttr(new Attribute(Ar, 200, 250));
const OrnatePlate = new Armor('Ornate Plate', 'Armor', 'Exceptional', 417, 450);
const Corpsemourn = new Unique(OrnatePlate, 'Corpsemourn', null, 0);
Corpsemourn.addAttr(new Attribute(EnhancedDef, 150, 180));
const DuskShroud = new Armor('Dusk Shroud', 'Armor', 'Elite', 361, 467);
const OrmusRobes = new Unique(DuskShroud, 'Ormus\' Robes', 0);
OrmusRobes.addAttr(new Attribute(Def, 10, 20));
OrmusRobes.addAttr(new Attribute(ColdDmg, 10, 15));
OrmusRobes.addAttr(new Attribute(FireDmg, 10, 15));
OrmusRobes.addAttr(new Attribute(LightDmg, 10, 15));
OrmusRobes.addAttr(new Attribute(ManaRegen, 10, 15));
const WireFleece = new Armor('Wire Fleece', 'Armor', 'Elite', 375, 481);
const GladiatorsBane = new Unique(WireFleece, 'Gladiator\'s Bane', null, 50);
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

const Boots = new Armor('Boots', 'Boots', 'Normal', 2, 3);
const Hotspur = new Unique(Boots, 'Hotspur', null, 6);
Hotspur.addAttr(new Attribute(EnhancedDef, 10, 20));
const HeavyBoots = new Armor('Heavy Boots', 'Boots', 'Normal', 5, 6);
const Gorefoot = new Unique(HeavyBoots, 'Gorefoot', null, 0);
Gorefoot.addAttr(new Attribute(EnhancedDef, 20, 30));
const ChainBoots = new Armor('Chain Boots', 'Boots', 'Normal', 8, 9);
const TreadsOfCthon = new Unique(ChainBoots, 'Treads of Cthon', null, 12);
TreadsOfCthon.addAttr(new Attribute(EnhancedDef, 30, 40));
const LightPlatedBoots = new Armor('Light Plated Boots', 'Boots', 'Normal', 9, 11);
const GoblinToe = new Unique(LightPlatedBoots, 'Goblin Toe', null, 15);
GoblinToe.addAttr(new Attribute(EnhancedDef, 60, 80));
const Greaves = new Armor('Greaves', 'Boots', 'Normal', 12, 15);
const Tearhaunch = new Unique(Greaves, 'Tearhaunch', 60, 80, 35);
Tearhaunch.addAttr(new Attribute(EnhancedDef, 60, 80));
const DemonhideBoots = new Armor('Demonhide Boots', 'Boots', 'Exceptional', 28, 35);
const Infernostride = new Unique(DemonhideBoots, 'Infernostride', 146, 15);
const SharkskinBoots = new Armor('Sharkskin Boots', 'Boots', 'Exceptional', 33, 39);
const Waterwalk = new Unique(SharkskinBoots, 'Waterwalk', null, 0);
Waterwalk.addAttr(new Attribute(EnhancedDef, 180, 210));
Waterwalk.addAttr(new Attribute(Life, 45, 65));
const MeshBoots = new Armor('Mesh Boots', 'Boots', 'Exceptional', 37, 44);
const Silkweave = new Unique(MeshBoots, 'Silkweave', null, 0);
Silkweave.addAttr(new Attribute(EnhancedDef, 150, 190));
const BattleBoots = new Armor('Battle Boots', 'Boots', 'Exceptional', 39, 47);
const WarTraveler = new Unique(BattleBoots, 'War Traveler', null, 0);
WarTraveler.addAttr(new Attribute(EnhancedDef, 150, 190));
WarTraveler.addAttr(new Attribute(AttackerTakesDmg, 5, 10));
WarTraveler.addAttr(new Attribute(MagicFind, 30, 50));
const WarBoots = new Armor('War Boots', 'Boots', 'Exceptional', 43, 53);
const GoreRider = new Unique(WarBoots, 'Gore Rider', null, 0);
GoreRider.addAttr(new Attribute(EnhancedDef, 160, 200));
const ScarabshellBoots = new Armor('Scarabshell Boots', 'Boots', 'Elite', 56, 65);
const SandstormTrek = new Unique(ScarabshellBoots, 'Sandstorm Trek', null, 0);
SandstormTrek.addAttr(new Attribute(EnhancedDef, 140, 170));
SandstormTrek.addAttr(new Attribute(Str, 10, 15));
SandstormTrek.addAttr(new Attribute(Vit, 10, 15));
SandstormTrek.addAttr(new Attribute(PsnRes, 40, 70));
const BoneweaveBoots = new Armor('Boneweave Boots', 'Boots', 'Elite', 59, 67);
const Marrowwalk = new Unique(BoneweaveBoots, 'Marrowwalk', null, 0);
Marrowwalk.addAttr(new Attribute(EnhancedDef, 170, 200));
Marrowwalk.addAttr(new SkillAttribute(empty, 'Skeleton Mastery', 1, 2));
Marrowwalk.addAttr(new Attribute(Str, 10, 20));
const MyrmidonGreaves = new Armor('Myrmidon Greaves', 'Boots', 'Elite', 62, 71);
const ShadowDancer = new Unique(MyrmidonGreaves, 'Shadow Dancer', null, 0);
ShadowDancer.addAttr(new Attribute(EnhancedDef, 70, 100));
ShadowDancer.addAttr(new SkillAttribute(empty, 'Shadow Disciplines', 1, 2));
ShadowDancer.addAttr(new Attribute(Dex, 15, 25));

const Tiara = new Armor('Tiara', 'Circlet', 'Elite', 40, 50);
const KirasGuardian = new Unique(Tiara, 'Kira\'s Guardian', null, 0);
KirasGuardian.addAttr(new Attribute(Def, 50, 120));
KirasGuardian.addAttr(new Attribute(AllRes, 50, 70));
const Diadem = new Armor('Diadem', 'Circlet', 'Elite', 50, 60);
const GriffonsEye = new Unique(Diadem, 'Griffon\'s Eye', null, 0);
GriffonsEye.addAttr(new Attribute(Def, 50, 120));
GriffonsEye.addAttr(new Attribute(EnemyLightResist, 15, 20));
GriffonsEye.addAttr(new Attribute(LightDmg, 10, 15));

const TotemicMask = new Armor('Totemic Mask', 'Druid Pelt', 'Exceptional', 73, 98);
const JalalsMane = new Unique(TotemicMask, 'Jalal\'s Mane', null, 0);
JalalsMane.addAttr(new Attribute(EnhancedDef, 150, 200));
const BloodSpirit = new Armor('Blood Spirit', 'Druid Pelt', 'Elite', 101, 145);
const CerebusBite = new Unique(BloodSpirit, 'Cerebus\' Bite', null, 0);
CerebusBite.addAttr(new Attribute(EnhancedDef, 130, 140));
CerebusBite.addAttr(new Attribute(ArPerc, 60, 120));
CerebusBite.addAttr(new Attribute(LifeSteal, 7, 10));
CerebusBite.addAttr(new SkillAttribute(empty, 'Shape Shifting Skills', 2, 4));
CerebusBite.addAttr(new SkillAttribute(empty, 'Feral Rage', 1, 2));
const SkySpirit = new Armor('Sky Spirit', 'Druid Pelt', 'Elite', 103, 155);
const Ravenlore = new Unique(SkySpirit, 'Ravenlore', null, 0);
Ravenlore.addAttr(new Attribute(EnhancedDef, 120, 150));
Ravenlore.addAttr(new Attribute(Energy, 20, 30));
Ravenlore.addAttr(new Attribute(EnemyFireResist, 10, 20));
Ravenlore.addAttr(new Attribute(AllRes, 15, 25));
const EarthSpirit = new Armor('Earth Spirit', 'Druid Pelt', 'Elite', 107, 152);
const SpiritKeeper = new Unique(EarthSpirit, 'Spirit Keeper', null, 0);
SpiritKeeper.addAttr(new Attribute(EnhancedDef, 170, 190));
SpiritKeeper.addAttr(new SkillAttribute(ClassSkills, 'Druid', 1, 2));
SpiritKeeper.addAttr(new Attribute(FireRes, 30, 40));
SpiritKeeper.addAttr(new Attribute(LightAsbInt, 9, 14));
SpiritKeeper.addAttr(new Attribute(ColdAbsorbPerc, 15, 25));

const CeremonialBow = new Weapon('Ceremonial Bow', 'Amazon', 'Exceptional', 19, 41);
const LycandersAim = new Unique(CeremonialBow, 'Lycander\'s Aim', null, 0);
LycandersAim.addAttr(new Attribute(EnhancedDmg, 150, 200));
LycandersAim.addAttr(new Attribute(ManaSteal, 5, 8));
const CeremonialPike = new Weapon('Ceremonial Pike', 'Amazon', 'Exceptional', 42, 101);
const LycandersFlank = new Unique(CeremonialPike, 'Lycander\'s Flank', null, 0);
LycandersFlank.addAttr(new Attribute(EnhancedDmg, 150, 200));
LycandersFlank.addAttr(new Attribute(LifeSteal, 5, 9));
const CeremonialJavelin = new Weapon('Ceremonial Javelin', 'Amazon', 'Exceptional', 18, 54);
const TitansRevenge = new Unique(CeremonialJavelin, 'Titan\'s Revenge', null, 0);
TitansRevenge.addAttr(new Attribute(EnhancedDmg, 150, 200));
TitansRevenge.addAttr(new Attribute(LifeSteal, 5, 9));
const MatriarchalBow = new Weapon('Matriarchal Bow', 'Amazon', 'Elite', 20, 47);
const BloodRavensCharge = new Unique(MatriarchalBow, 'Blood Raven\s Charge', null, 0);
BloodRavensCharge.addAttr(new Attribute(EnhancedDmg, 180, 230));
BloodRavensCharge.addAttr(new Attribute(ArPerc, 200, 300));
BloodRavensCharge.addAttr(new SkillAttribute(ClassSkillTree, 'Bow and Crossbow Skills', 2, 4));
const MatriarchalSpear = new Weapon('Matriarchal Spear', 'Amazon', 'Elite', 65, 95);
const Stoneraven = new Unique(MatriarchalSpear, 'Stoneraven', null, 0);
Stoneraven.addAttr(new Attribute(EnhancedDmg, 230, 280));
Stoneraven.addAttr(new Attribute(Def, 400, 600));
Stoneraven.addAttr(new Attribute(AllRes, 30, 50));
Stoneraven.addAttr(new SkillAttribute(ClassSkillTree, 'Javelin and Spear Skills', 1, 3));
const MatriarchalJavelin = new Weapon('Matriarchal Javelin', 'Amazon', 'Elite', 30, 54);
const Thunderstroke = new Unique(MatriarchalJavelin, 'Thunderstroke', null, 0);
Thunderstroke.addAttr(new Attribute(EnhancedDmg, 150, 200));
Thunderstroke.addAttr(new SkillAttribute(ClassSkillTree, 'Javelin and Spear Skills', 2, 3));
