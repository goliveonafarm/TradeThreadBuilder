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

export class Base {
    static baseArray = [];
    constructor(baseName, itemClass, tier) {
        this._baseName = baseName;
        this._itemClass = itemClass;
        this._tier = tier;
        this._isEth = false;
        this._ed = null;
        this._addedthisRowField = 0;
        this._sockets = 0;
        this._type = 'Jewelry';
        Base.baseArray.push(this);
    }
    get baseName() { return this._baseName; }
    get itemClass() { return this._itemClass; }
    set ed(newEd) {
        if (Object.hasOwn(this, '_thisRowFieldActVal')) this._defActVal = this._maxDef;
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

    }
    setEd(newEd) {
        this._base._ed = newEd;
    }
    addAttr(attr) {
        let g = attr._attributeName._attrName;
        if (g == '% Enhanced Defense') { this._base._ed = attr._attrFloorActVal }
        if (g == 'Defense') { this._base._addedDef = attr._attrFloorActVal }
        this._arr.push(attr)
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
const ArUndead = new AttributeName('Attack Rating vs Undead +')
const ArDemon = new AttributeName('Attack Rating vs Demons +')
const ArAndED = new AttributeName('Attack Rating - Enhanced Damage');
const DmgDemon = new AttributeName('Damage to Demons %')
const DmgUndead = new AttributeName('Damage to Undead %')
const DefVsMisl = new AttributeName('Defense vs Missiles')
const ColdDmg = new AttributeName('Cold Damage');
const FireDmg = new AttributeName('Fire Damage');
const LightDmg = new AttributeName('Lightning Damage');
const PsnDmg = new AttributeName('Poison Damage')
const ColdDmgPerc = new AttributeName('Cold Damage +%');
const FireDmgPerc = new AttributeName('Fire Damage +%');
const LightDmgPerc = new AttributeName('Lightning Damage +%');
const PsntDmgPerc = new AttributeName('Poison Damage +%');
const AllRes = new AttributeName('All Resist %');
const ColdRes = new AttributeName('Cold Resist %');
const FireRes = new AttributeName('Fire Resist %');
const LightRes = new AttributeName('Lightning Resist %');
const PsnRes = new AttributeName('Poison Resist %');
const ColdAsbInt = new AttributeName('Cold Absorb')
const FireAsbInt = new AttributeName('Fire Absorb')
const LightAsbInt = new AttributeName('Lightning Absorb');
const ColdAbsorbPerc = new AttributeName('Cold Absorb %');
const FireAbsorbPerc = new AttributeName('Fire Absorb %');
const LightAbsorbPerc = new AttributeName('Lightning Absorb %')
const EnemyLightResist = new AttributeName('Enemy Lightning Reist -%');
const EnemyFireResist = new AttributeName('Enemy Fire Resist -%');
const EnemyColdResist = new AttributeName('Enemy Cold Resist-%');
const EnemyPsnResist = new AttributeName('Enemy Poison Resist -%');
const MaxDmg = new AttributeName('Maximum Damage');
const MinDmg = new AttributeName('Minimum Damage');
const StackSize = new AttributeName('Quantity');
const LightRad = new AttributeName('Light Radius');
const MagicFind = new AttributeName('Magic Find %');
const GoldFind = new AttributeName('Gold Find %')
const RedcVendPrices = new AttributeName('Reduces Vendor Prices %')
const Mana = new AttributeName('Mana');
const DmgToMana = new AttributeName('Damage Taken Goes to Mana %');
const ManaOnKill = new AttributeName('Mana After Each Kill');
const LifeOnKill = new AttributeName('Life After Each Kill')
const AllSkills = new AttributeName('All Skills');
const Skills = new AttributeName('Skills');
const ClassSkills = new AttributeName('Class Skills');
const ClassSkillTree = new AttributeName('Class Skill Tree');
const FCR = new AttributeName('Faster Cast Rate');
const BlockAndFasterBlock = new AttributeName('Chance of Blocking - Faster Block Rate');
const IncrChanceBlockPerc = new AttributeName('Increase Chance to Block %')
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
const HitFlee = new AttributeName('Hit causes Monster to Flee');
const MaxStam = new AttributeName('Maximum Stamina');
const empty = new AttributeName('');
const IgnoreTgtDef = new AttributeName('Ignore Target Defense');
const Knockback = new AttributeName('Knockback');
const PrevMnstHeal = new AttributeName('Prevent Monster Heal');
const AttackerTakesDmg = new AttributeName('Attacker Takes Damage of');
const Repair = new AttributeName('Repairs 1 duarbility in seconds x');
const PsnLength = new AttributeName('Poison Length Reduced by %');
const LevelRequirement = new AttributeName('Level Requirement');
const Durability = new AttributeName('Durability');
const AllAttributes = new AttributeName('All attributes +');
const ExperGained = new AttributeName('Experience Gained %')


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

const LeatherGloves = new Armor('Leather Gloves', 'Gloves', 'Normal', 2, 3);
const HandOfBroc = new Unique(LeatherGloves, 'HandOfBroc', 14, 10);
const HeavyGloves = new Armor('Heavy Gloves', 'Gloves', 'Normal', 5, 6);
const Bloodfist = new Unique(HeavyGloves, 'Bloodfist', null, 10);
Bloodfist.addAttr(new Attribute(EnhancedDef, 10, 20));
const ChainGloves = new Armor('Chain Gloves', 'Gloves', 'Normal', 8, 9);
const ChanceGuards = new Unique(ChainGloves, 'Chance Guards', null, 15);
ChanceGuards.addAttr(new Attribute(EnhancedDef, 20, 30));
ChanceGuards.addAttr(new Attribute(MagicFind, 25, 40));
const LightGauntlets = new Armor('Light Gauntlets', 'Gloves', 'Normal', 9, 11);
const Magefist = new Unique(LightGauntlets, 'Magefist', null, 10);
Magefist.addAttr(new Attribute(EnhancedDef, 20, 30));
const Gauntlets = new Armor('Gauntlets', 'Gloves', 'Normal', 12, 15);
const Frostburn = new Unique(Gauntlets, 'Frostburn', null, 30);
Frostburn.addAttr(new Attribute(EnhancedDef, 10, 20));
const DemonhideGloves = new Armor('Demonhide Gloves', 'Gloves', 'Exceptional', 28, 35);
const VenomGrip = new Unique(DemonhideGloves, 'Venom Grip', null, 0);
VenomGrip.addAttr(new Attribute(EnhancedDef, 130, 160));
VenomGrip.addAttr(new Attribute(Def, 15, 25));
const SharkskinGloves = new Armor('Sharkskin Gloves', 'Gloves', 'Exceptional', 33, 39);
const GravePalm = new Unique(SharkskinGloves, 'Gravepalm', null, 0);
GravePalm.addAttr(new Attribute(EnhancedDef, 140, 180));
GravePalm.addAttr(new Attribute(DmgUndead, 100, 200));
GravePalm.addAttr(new Attribute(ArUndead, 100, 200));
const HeavyBracers = new Armor('Heavy Bracers', 'Gloves', 'Exceptional', 37, 44);
const Ghoulhide = new Unique(HeavyBracers, 'Ghoulhide', null, 0);
Ghoulhide.addAttr(new Attribute(EnhancedDef, 150, 190));
Ghoulhide.addAttr(new Attribute(ManaSteal, 4, 5));
const BattleGauntlets = new Armor('Battle Gauntlets', 'Gloves', 'Exceptional', 39, 47);
const LavaGout = new Unique(BattleGauntlets, 'Lava Gout', null, 0);
LavaGout.addAttr(new Attribute(EnhancedDef, 150, 200));
const WarGauntlets = new Armor('War Gauntlets', 'Gloves', 'Exceptional', 43, 53)
const Hellmouth = new Unique(WarGauntlets, 'Hellmouth', null, 0);
Hellmouth.addAttr(new Attribute(EnhancedDef, 150, 200));
const VampireboneGloves = new Armor('Vampirebone Gloves', 'Gloves', 'Elite', 56, 65);
const DraculsGrasp = new Unique(VampireboneGloves, 'Draculs Grasp', null, 0);
DraculsGrasp.addAttr(new Attribute(EnhancedDef, 90, 120));
DraculsGrasp.addAttr(new Attribute(Str, 10, 15));
DraculsGrasp.addAttr(new Attribute(LifeOnKill, 5, 10));
DraculsGrasp.addAttr(new Attribute(LifeSteal, 7, 10));
const Vambraces = new Armor('Vambraces', 'Gloves', 'Elite', 59, 67);
const SoulDrainer = new Unique(Vambraces, 'Soul Drainer', null, 0);
SoulDrainer.addAttr(new Attribute(EnhancedDef, 90, 120));
SoulDrainer.addAttr(new Attribute(ManaSteal, 4, 7));
SoulDrainer.addAttr(new Attribute(LifeSteal, 4, 7));
const OgreGauntlets = new Armor('Ogre Gauntlets', 'Gloves', 'Elite', 62, 71)
const Steelrend = new Unique(OgreGauntlets, 'Steelrend', null, 0);
Steelrend.addAttr(new Attribute(Def, 170, 210));
Steelrend.addAttr(new Attribute(EnhancedDmg, 30, 60));
Steelrend.addAttr(new Attribute(Str, 15, 20));

const Cap = new Armor('Cap', 'Helm', 'Normal', 3, 5);
const BiggonsBonnet = new Unique(Cap, 'Biggin\'s Bonnet', 30, 14);
const SkullCap = new Armor('Skull Cap', 'Helm', 'Normal', 8, 11);
const Tarnhelm = new Unique(SkullCap, 'Tarnhelm', null, 0);
Tarnhelm.addAttr(new Attribute(MagicFind, 25, 50));
const Helm = new Armor('Helm', 'Helm', 'Normal', 15, 18);
const CoifOfGlory = new Unique(Helm, 'Coif of Glory', null, 10);
const FullHelm = new Armor('Full Helm', 'Helm', 'Normal', 23, 26);
const Duskdeep = new Unique(FullHelm, 'Duskdeep', 44, 11);
const GreatHelm = new Armor('Great Helm', 'Helm', 'Normal', 30, 35);
const Howltusk = new Unique(GreatHelm, 'Howltusk', 80, 0);
const Mask = new Armor('Mask', 'Helm', 'Normal', 9, 27);
const TheFaceOfHorror = new Unique(Mask, 'Face of Horror', null, 25);
const Crown = new Armor('Crown', 'Helm', 'Normal', 25, 45);
const UndeadCrown = new Unique(Crown, 'Undead Crown', null, 40);
UndeadCrown.addAttr(new Attribute(EnhancedDef, 30, 60));
UndeadCrown.addAttr(new Attribute(ArUndead, 50, 100));
const BoneHelm = new Armor('Bonehelm', 'Helm', 'Normal', 33, 36);
const Wormskull = new Unique(BoneHelm, 'Wormskull', null, 0);
const WarHat = new Armor('War Hat', 'Helm', 'Exceptional', 45, 53);
const PeasantCrown = new Unique(WarHat, 'Peasant Crown', 100, 0);
PeasantCrown.addAttr(new Attribute(ReplLife, 6, 12));
const Sallet = new Armor('Sallet', 'Helm', 'Exceptional', 52, 62);
const Rockstopper = new Unique(Sallet, 'Rockstopper', null, 0);
Rockstopper.addAttr(new Attribute(EnhancedDef, 160, 220));
Rockstopper.addAttr(new Attribute(ColdRes, 20, 40));
Rockstopper.addAttr(new Attribute(FireRes, 20, 50));
Rockstopper.addAttr(new Attribute(LightRes, 20, 40));
const Casque = new Armor('Casque', 'Helm', 'Exceptional', 63, 72);
const Stealskull = new Unique(Casque, 'Stealskull', null, 0);
Stealskull.addAttr(new Attribute(EnhancedDef, 200, 240));
Stealskull.addAttr(new Attribute(MagicFind, 30, 50));
const Basinet = new Armor('Basinet', 'Helm', 'Exceptional', 75, 84);
const DarksightHelm = new Unique(Basinet, 'Darksight Helm', null, 0);
DarksightHelm.addAttr(new Attribute(FireRes, 20, 40));
const WingedHelm = new Armor('Winged Helm', 'Helm', 'Normal', 85, 98);
const ValkyrieWing = new Unique(WingedHelm, 'Valkyrie Wing', null, 0);
ValkyrieWing.addAttr(new Attribute(EnhancedDef, 150, 200));
ValkyrieWing.addAttr(new SkillAttribute(empty, 'Amazon Skills', 1, 2));
ValkyrieWing.addAttr(new Attribute(ManaOnKill, 2, 4));
const DeathMask = new Armor('Death Mask', 'Helm', 'Exceptional', 54, 86);
const BlackhornsFace = new Unique(DeathMask, 'Death Mask', null, 0);
BlackhornsFace.addAttr(new Attribute(EnhancedDef, 180, 220));
const GrandCrown = new Armor('Grand Crown', 'Helm', 'Exceptional', 78, 113);
const CrownOfThieves = new Unique(GrandCrown, 'Crown of Thieves', null, 0);
CrownOfThieves.addAttr(new Attribute(EnhancedDef, 160, 200));
CrownOfThieves.addAttr(new Attribute(LifeSteal, 9, 12));
const GrimHelm = new Armor('Grim Helm', 'Helm', 'Exceptional', 60, 125);
const VampireGaze = new Unique(GrimHelm, 'Vampire Gaze', 100, 0);
VampireGaze.addAttr(new Attribute(LifeSteal, 6, 8));
VampireGaze.addAttr(new Attribute(ManaSteal, 6, 8));
VampireGaze.addAttr(new Attribute(DmgReducePercent, 15, 20));
VampireGaze.addAttr(new Attribute(MageDmgReduce, 10, 15));
const Shako = new Armor('Shako', 'Helm', 'Elite', 98, 141);
const HarlequinCrest = new Unique(Shako, 'Shako Harlequin Crest', null, 0);
const Armet = new Armor('Armet', 'Helm', 'Elite', 105, 149);
const SteelShade = new Unique(Armet, 'Steel Shade', null, 0)
SteelShade.addAttr(new Attribute(EnhancedDef, 100, 130));
SteelShade.addAttr(new Attribute(ReplLife, 10, 18));
SteelShade.addAttr(new Attribute(ManaSteal, 4, 8));
SteelShade.addAttr(new Attribute(FireAsbInt, 5, 11));
const SpiredHelm = new Armor('Spired Helm', 'Helm', 'Elite', 114, 159);
const VeilOfSteel = new Unique(SpiredHelm, 'Veil of Steel', 60, 140);
const NightwingsVeil = new Unique(SpiredHelm, 'Nightwing\'s Veil', null, 0);
NightwingsVeil.addAttr(new Attribute(EnhancedDef, 90, 120));
NightwingsVeil.addAttr(new Attribute(ColdDmg, 8, 15));
NightwingsVeil.addAttr(new Attribute(Dex, 10, 20));
NightwingsVeil.addAttr(new Attribute(ColdAsbInt, 5, 9));
const Demonhead = new Armor('Demonhead', 'Helm', 'Elite', 101, 154);
const AndarielsVisage = new Unique(Demonhead, 'Andariel\'s Visage', null, 0);
AndarielsVisage.addAttr(new Attribute(EnhancedDef, 100, 150));
AndarielsVisage.addAttr(new Attribute(LifeSteal, 8, 10));
AndarielsVisage.addAttr(new Attribute(Str, 25, 30));
const Corona = new Armor('Corona', 'Helm', 'Elite', 111, 165);
const CrownOfAges = new Unique(Corona, 'Crown of Ages', 50, 0);
CrownOfAges.addAttr(new Attribute(Def, 100, 150));
CrownOfAges.addAttr(new Attribute(DmgReducePercent, 10, 15));
CrownOfAges.addAttr(new Attribute(AllRes, 20, 30));
const BoneVisage = new Armor('Bone Visage', 'Helm', 'Elite', 100, 157)
const GiantSkull = new Unique(BoneVisage, 'Giant Skull', null, 0);
GiantSkull.addAttr(new Attribute(Def, 250, 320));
GiantSkull.addAttr(new Attribute(Str, 25, 35));

const GildedShield = new Armor('Gilded Shield', 'Paladin Shield', 'Exceptional', 144, 168);
const HeraldOfZakarum = new Unique(GildedShield, 'Herald of Zakarum', null, 0);
HeraldOfZakarum.addAttr(new Attribute(EnhancedDef, 150, 200));
const SacredRondache = new Armor('Sacred Rondache', 'Paladin Shield', 'Elite', 138, 164);
const AlmaNegra = new Unique(SacredRondache, 'Alma Negra', null, 0);
AlmaNegra.addAttr(new Attribute(EnhancedDef, 180, 210));
AlmaNegra.addAttr(new SkillAttribute(empty, 'Paladin Skills', 1, 2));
AlmaNegra.addAttr(new Attribute(EnhancedDmg, 40, 75));
AlmaNegra.addAttr(new Attribute(ArPerc, 40, 75));
AlmaNegra.addAttr(new Attribute(MageDmgReduce, 5, 9));
const ZakarumShield = new Armor('Zakarum Shield', 'Paladin Shield', 'Elite', 169, 193);
const Dragonscale = new Unique(ZakarumShield, 'Dragonscale', null, 0);
Dragonscale.addAttr(new Attribute(EnhancedDef, 170, 200));
Dragonscale.addAttr(new Attribute(Str, 15, 25));
Dragonscale.addAttr(new Attribute(FireAbsorbPerc, 10, 20));

const Buckler = new Armor('Buckler', 'Shield', 'Normal', 4, 6);
const PeltaLunata = new Unique(Buckler, 'Pelta Lunata', null, 30);
PeltaLunata.addAttr(new Attribute(EnhancedDef, 30, 40));
const SmallShield = new Armor('Small Shield', 'Shield', 'Normal', 8, 10);
const UmbralDisk = new Unique(SmallShield, 'Umbral Disk', null, 30);
UmbralDisk.addAttr(new Attribute(EnhancedDef, 40, 50));
UmbralDisk.addAttr(new Attribute(Durability, 10, 15));
const LargeShield = new Armor('Large Shield', 'Shield', 'Normal', 12, 14);
const Stormguild = new Unique(LargeShield, 'Stormguild', null, 30);
Stormguild.addAttr(new Attribute(EnhancedDef, 50, 60));
const KiteShield = new Armor('Kite Shield', 'Shield', 'Normal', 16, 18);
const Steelclash = new Unique(KiteShield, 'Steelclash', null, 20);
Steelclash.addAttr(new Attribute(EnhancedDef, 60, 100));
const SpikedShield = new Armor('Spiked Shield', 'Shield', 'Normal', 15, 25);
const SwordbackHold = new Unique(SpikedShield, 'Swordback Hold', null, 10);
SwordbackHold.addAttr(new Attribute(EnhancedDef, 30, 60));
const TowerShield = new Armor('Tower Shield', 'Shield', 'Normal', 22, 25);
const BverritKeep = new Unique(TowerShield, 'Bverrit Keep', null, 30);
BverritKeep.addAttr(new Attribute(EnhancedDef, 80, 120));
const Boneshield = new Armor('Bone Shield', 'Shield', 'Normal', 10, 30);
const WallOfTheEyeless = new Unique(Boneshield, 'Wall of the Eyeless', null, 10);
WallOfTheEyeless.addAttr(new Attribute(EnhancedDef, 30, 40));
const GothicShield = new Armor('Gothic Shield', 'Shield', 'Normal', 30, 35);
const TheWard = new Unique(GothicShield, 'Ward', 100, 40);
TheWard.addAttr(new Attribute(AllRes, 30, 50));
const Defender = new Armor('Defender Shield', 'Shield', 'Exceptional', 41, 49);
const Visceratuant = new Unique(Defender, 'Visceratuant', null, 0);
Visceratuant.addAttr(new Attribute(EnhancedDef, 100, 150));
const RoundShield = new Armor('Round Shield', 'Shield', 'Exceptional', 47, 55);
const MosersBlessed = new Unique(RoundShield, 'Moser\'s Blessed', null, 0);
MosersBlessed.addAttr(new Attribute(EnhancedDef, 180, 220));
const Scutum = new Armor('Scutum', 'Shield', 'Exceptional', 53, 61);
const Stormchaser = new Unique(Scutum, 'Stormchaser', null, 0);
Stormchaser.addAttr(new Attribute(EnhancedDef, 160, 220));
const BarbedShield = new Armor('Barbed Shield', 'Shield', 'Exceptional', 58, 78);
const LanceGuard = new Unique(BarbedShield, 'Lance Guard', null, 0);
LanceGuard.addAttr(new Attribute(EnhancedDef, 70, 120));
const DragonShield = new Armor('Dragon Shield', 'Shield', 'Exceptional', 59, 67);
const TiamatsRebuke = new Unique(DragonShield, 'Tiamats Rebuke', null, 0);
TiamatsRebuke.addAttr(new Attribute(EnhancedDef, 140, 200));
TiamatsRebuke.addAttr(new Attribute(AllRes, 25, 35));
const GrimShield = new Armor('Grim Shield', 'Shield', 'Exceptional', 50, 150);
const LidlessWall = new Unique(GrimHelm, 'Lidless Wall', null, 0);
LidlessWall.addAttr(new Attribute(EnhancedDef, 80, 130));
LidlessWall.addAttr(new Attribute(ManaOnKill, 3, 5));
const Pavise = new Armor('Pavise', 'Shield', 'Exceptional', 68, 78);
const Gerkes = new Unique(Pavise,'Gerke\'s', null, 0);
Gerkes.addAttr(new Attribute(EnhancedDef, 180, 240));
Gerkes.addAttr(new Attribute(AllRes, 20, 30));
Gerkes.addAttr(new Attribute(DmgReduce, 11, 16));
Gerkes.addAttr(new Attribute(MageDmgReduce, 14, 18));
const AncientShield = new Armor('Ancient Shield', 'Shield', 'Exceptional', 80, 93);
const RadamentsSphere = new Unique(AncientShield, 'Radament\'s Sphere', null, 0);
RadamentsSphere.addAttr(new Attribute(EnhancedDef, 160, 200));

const Heater = new Armor('Heater', 'Shield', 'Elite', 95, 110);
const Luna = new Armor('Luna', 'Shield', 'Elite', 108, 123);
const BlackoakShield = new Unique(Luna, 'Blackoak Shield', null, 0);
BlackoakShield.addAttr(new Attribute(EnhancedDef, 160, 200));
const Hyperion = new Armor('Hyperion', 'Shield', 'Elite', 119, 135);
const Monarch = new Armor('Monarch', 'Shield', 'Elite', 133, 148);
const Stormshield = new Unique(Monarch, 'Stormshield', null, 0)
const BladeBarrier = new Armor('BladeBarrier', 'Shield', 'Elite', 147, 163);
const SpikeThorn = new Unique(BladeBarrier, 'Spike Thorn', null, 0);
SpikeThorn.addAttr(new Attribute(EnhancedDef, 120, 150));
const Aegis = new Armor('Aegis', 'Shield', 'Elite', 145, 161);
const MedusasGaze = new Unique(Aegis, 'Medusa\'s Gaze', null, 0);
MedusasGaze.addAttr(new Attribute(EnhancedDef, 150, 180));
MedusasGaze.addAttr(new Attribute(LifeSteal, 5, 9));
MedusasGaze.addAttr(new Attribute(ColdRes, 40, 80));
const TrollNest = new Armor('Troll Nest', 'Shield', 'Elite', 158, 173);
const HeadHuntersGlory = new Unique(TrollNest, 'Head Hunter\'s Glory', null, 0);
HeadHuntersGlory.addAttr(new Attribute(Def, 320, 420));
HeadHuntersGlory.addAttr(new Attribute(DefVsMisl, 300, 350));
HeadHuntersGlory.addAttr(new Attribute(FireRes, 20, 30));
HeadHuntersGlory.addAttr(new Attribute(PsnRes, 30, 40));
HeadHuntersGlory.addAttr(new Attribute(LifeOnKill, 5, 7));
const Ward = new Armor('Ward', 'Shield', 'Elite', 153, 170);
const SpiritWard = new Unique(Ward, 'Spirit Ward', null, 0);
SpiritWard.addAttr(new Attribute(EnhancedDef, 130, 180));
SpiritWard.addAttr(new Attribute(IncrChanceBlockPerc, 20, 30));
SpiritWard.addAttr(new Attribute(ColdAsbInt, 6, 11));

const HierophantTrophy = new Armor('Hierophant Trophy', 'Shrunken Head', 'Exceptional', 58, 70);
const Homunculus = new Unique(HierophantTrophy, 'Homunculus', null, 0);
Homunculus.addAttr(new Attribute(EnhancedDef, 150, 200));
const BloodlordSkull = new Armor('Bloodlord Skull', 'Shrunken Head', 'Elite', 103, 148);
const DarkforceSpawn = new Unique(BloodlordSkull, 'Darkforce Spawn', null, 0);
DarkforceSpawn.addAttr(new Attribute(EnhancedDef, 140, 180));
DarkforceSpawn.addAttr(new SkillAttribute(empty, 'Summoning Skills', 1, 3));
DarkforceSpawn.addAttr(new SkillAttribute(empty, 'Poison and Bone Spells', 1, 3));
DarkforceSpawn.addAttr(new SkillAttribute(empty, 'Cursses', 1, 3));
const SuccubusSkull = new Armor('Succubus Skull', 'Shrunken Head', 'Elite', 100, 146);
const Boneflame = new Unique(SuccubusSkull, 'Boneflame', null, 0);
Boneflame.addAttr(new Attribute(EnhancedDef, 120, 150));
Boneflame.addAttr(new SkillAttribute(empty, 'Necromancer Skill Levels', 2, 3))
Boneflame.addAttr(new Attribute(AllRes, 20, 30));

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
BloodRavensCharge.addAttr(new SkillAttribute(empty, 'Bow and Crossbow Skills', 2, 4));
const MatriarchalSpear = new Weapon('Matriarchal Spear', 'Amazon', 'Elite', 65, 95);
const Stoneraven = new Unique(MatriarchalSpear, 'Stoneraven', null, 0);
Stoneraven.addAttr(new Attribute(EnhancedDmg, 230, 280));
Stoneraven.addAttr(new Attribute(Def, 400, 600));
Stoneraven.addAttr(new Attribute(AllRes, 30, 50));
Stoneraven.addAttr(new SkillAttribute(empty, 'Javelin and Spear Skills', 1, 3));
const MatriarchalJavelin = new Weapon('Matriarchal Javelin', 'Amazon', 'Elite', 30, 54);
const Thunderstroke = new Unique(MatriarchalJavelin, 'Thunderstroke', null, 0);
Thunderstroke.addAttr(new Attribute(EnhancedDmg, 150, 200));
Thunderstroke.addAttr(new SkillAttribute(empty, 'Javelin and Spear Skills', 2, 3));

const SwirlingCrystal = new Weapon('Swirling Crystal', 'Sorceress Orb', '', 18, 42);
const Oculus = new Unique(SwirlingCrystal, 'Oculus', null, 0);
const EldritchOrb = new Weapon('Eldritch Orb', 'Sorceress Orb', '', 18, 50);
const EschutasTemper = new Unique(EldritchOrb, 'Eschuta\'s Temper', null, 0);
EschutasTemper.addAttr(new SkillAttribute(empty, 'Sorceress Skills', 1, 3));
EschutasTemper.addAttr(new Attribute(FireDmgPerc, 10, 20));
EschutasTemper.addAttr(new Attribute(LightDmgPerc, 10, 20));
EschutasTemper.addAttr(new Attribute(Energy, 20, 30));
const DimensionalShard = new Weapon('Dimensional Shard', 'Sorceress Orb', '', 30, 53);
const DeathsFathom = new Unique(DimensionalShard, 'Death\'s Fathom', null, 0);
DeathsFathom.addAttr(new Attribute(ColdDmgPerc, 15, 30));
DeathsFathom.addAttr(new Attribute(LightRes, 25, 40));
DeathsFathom.addAttr(new Attribute(FireRes, 25, 40));

const Wand = new Weapon('Wand', 'Wand', 'Normal', 2, 4);
const TorchOfIro = new Unique(Wand, 'Torch of Iro', null, 0);
const YewWand = new Weapon('Yew Wand', 'Wand', 'Normal', 2, 8);
const Maelstrom = new Unique(YewWand, 'Maelstrom', null, 0);
Maelstrom.addAttr(new SkillAttribute(empty, 'Iron Maiden', 1, 3));
Maelstrom.addAttr(new SkillAttribute(empty, 'Amplify Damage', 1, 3));
Maelstrom.addAttr(new SkillAttribute(empty, 'Terror', 1, 3));
Maelstrom.addAttr(new SkillAttribute(empty, 'Corpse Explosion', 1, 3));
const BoneWand = new Weapon('Bone Wand', 'Wand', 'Normal', 3, 7);
const Gravespine = new Unique(BoneWand, 'Gravespine', null, 0);
Gravespine.addAttr(new Attribute(Mana, 25, 50));
const GrimWand = new Weapon('GrimWand', 'Wand', 'Normal', 5, 11);
let UmesLament = new Unique(GrimWand, 'Ume\'s Lament', 'Wand', 5, 11);
const BurntWand = new Weapon('Burnt Wand', 'Wand', 'Exceptional', 8, 18)
const SuicideBranch = new Unique(BurntWand, 'Suicide Branch', null, 0);
const PetrifiedWand = new Weapon('Petrified Wand', 'Wand', 'Exceptional', 8, 24);
const CarinShard = new Unique(PetrifiedWand, 'Carin Shard', null, 0);
const TombWand = new Weapon('Tomb Wand', 'Wand', 'Exceptional', 10, 22);
const ArmOfKingLeoric = new Unique(TombWand, 'Arm of King Leoric', null, 0);
const GraveWand = new Weapon('Grave Wand', 'Wand', 'Exceptional', 13, 29);
const BlackhandKey = new Unique(GraveWand, 'Blackhand Key', null, 0);
const LichWand = new Weapon('Lich Wand', 'Wand', 'Elite', 10, 31);
const Boneshade = new Unique(LichWand, 'Boneshade', null, 0);
Boneshade.addAttr(new SkillAttribute(empty, 'Bone Spirit', 1, 2));
Boneshade.addAttr(new SkillAttribute(empty, 'Bone Spear', 2, 3));
Boneshade.addAttr(new SkillAttribute(empty, 'Bone Wall', 2, 3));
Boneshade.addAttr(new SkillAttribute(empty, 'Bone Armor', 4, 5));
Boneshade.addAttr(new SkillAttribute(empty, 'Teeth', 4, 5));
const UnearthedWand = new Weapon('Unearthed Wand', 'Wand', 'Elite', 22, 28);
const DeathsWeb = new Unique(UnearthedWand, 'Death\'s Web', null, 0);
DeathsWeb.addAttr(new SkillAttribute(empty, 'Poison and Bone Spells', 1, 2));
DeathsWeb.addAttr(new Attribute(EnemyPsnResist, 40, 50));
DeathsWeb.addAttr(new Attribute(ManaOnKill, 7, 12));
DeathsWeb.addAttr(new Attribute(LifeOnKill, 7, 12));

const SmallCharm = new Base('Small Charm', 'Charm', 'Elite');
const Annihilus = new Unique(SmallCharm, 'Annihilus', null, 0);
Annihilus.addAttr(new Attribute(AllAttributes, 10, 20));
Annihilus.addAttr(new Attribute(AllRes, 10, 20));
Annihilus.addAttr(new Attribute(ExperGained, 5, 10));
const LargeCharm = new Base('Large Charm', 'Charm', 'Elite');
const HellfireTorch = new Unique(LargeCharm, 'Hellfire Torch', null, 0);
HellfireTorch.addAttr(new Attribute(AllAttributes, 10, 20));
HellfireTorch.addAttr(new Attribute(AllRes, 10, 20));
HellfireTorch.addAttr(new SkillAttribute(empty, 'EDItTHISSSSSSSSSSSS Skills +', 3, 3))
const GrandCharm = new Base('Grand Charm', 'Charm', 'Elite');
const GheedsFortune = new Unique(GrandCharm, 'Gheed\'s Fortune', null, 0);
GheedsFortune.addAttr(new Attribute(GoldFind, 80, 160));
GheedsFortune.addAttr(new Attribute(RedcVendPrices, 10, 15));
GheedsFortune.addAttr(new Attribute(MagicFind, 20, 40));

const Amulet = new Base('Amulet', 'Amulet', 'Elite');
const NokozanRelic = new Unique(Amulet, 'Nokozan Relic', null, 0);
const EyeOfTheEtlich = new Unique(Amulet, 'Eye of Etlich', null, 0);
EyeOfTheEtlich.addAttr(new Attribute(LightRad, 1, 5));
EyeOfTheEtlich.addAttr(new Attribute(LifeSteal, 3, 7));
EyeOfTheEtlich.addAttr(new TwoFieldAttribute(ColdDmg, 1, 2, 3, 5,))
EyeOfTheEtlich.addAttr(new Attribute(DefVsMisl, 10, 40));
const MahimOakCurio = new Unique(Amulet, 'Mahim-Oak Curio', null, 0);
const SaracensChance = new Unique(Amulet, 'Saracen\'s Chance', null, 0);
SaracensChance.addAttr(new Attribute(AllRes, 15, 25));
const CatsEye = new Unique(Amulet, 'Cat\'s Eye', null, 0);
const CrescentMoon = new Unique(Amulet, 'Crescent Moon', null, 0);
CrescentMoon.addAttr(new Attribute(LifeSteal, 3, 6));
CrescentMoon.addAttr(new Attribute(ManaSteal, 11, 15));
const AtmasScarab = new Unique(Amulet, 'Atma\'s Scarab', null, 0);
const RisingSun = new Unique(Amulet, 'Rising Sun', null, 0);
const HighlordsWrath = new Unique(Amulet, 'Highlord\'s Wrath', null, 0);
const MarasKaleidoscope = new Unique(Amulet, 'Mara\'s Kaleidoscope', null, 0);
MarasKaleidoscope.addAttr(new Attribute(AllRes, 20, 30));
const SeraphsHymn = new Unique(Amulet, 'Seraph\'s Hymn', null, 0);
SeraphsHymn.addAttr(new SkillAttribute(empty, 'Defensive Auras', 1, 2));
SeraphsHymn.addAttr(new Attribute(DmgDemon, 20, 50));
SeraphsHymn.addAttr(new Attribute(ArDemon, 150, 250));
SeraphsHymn.addAttr(new Attribute(DmgUndead, 20, 50));
SeraphsHymn.addAttr(new Attribute(ArUndead, 150, 250));
const Metalgrid = new Unique(Amulet, 'Metalgrid', null, 0);
Metalgrid.addAttr(new Attribute(Ar, 400, 450));
Metalgrid.addAttr(new Attribute(AllRes, 25, 35));
Metalgrid.addAttr(new Attribute(Def, 300, 350));

const Ring = new Base('Ring', 'Ring', 'Elite');
const Nagelring = new Unique(Ring, 'Nagelring', null, 0);
Nagelring.addAttr(new Attribute(Ar, 50, 75));
Nagelring.addAttr(new Attribute(MagicFind, 15, 30));
const ManaldHeal = new Unique(Ring, 'Manald Heal', null, 0);
ManaldHeal.addAttr(new Attribute(ManaSteal, 4, 7));
ManaldHeal.addAttr(new Attribute(ReplLife, 5, 8));
const StoneOfTheJordan = new Unique(Ring, 'Soj', null, 0);
const DwarfStar = new Unique(Ring, 'Dwarf Star', null, 0);
DwarfStar.addAttr(new Attribute(MageDmgReduce, 12, 15));
const RavenFrost = new Unique(Ring, 'RavenFrost', null, 0);
RavenFrost.addAttr(new Attribute(Ar, 150, 250));
RavenFrost.addAttr(new Attribute(Dex, 15, 20));
const BulKathosWeddingBand = new Unique(Ring, 'BK Bul-Katho\'s Wedding Band', null, 0);
BulKathosWeddingBand.addAttr(new Attribute(LifeSteal, 3, 5));
const CarrionWind = new Unique(Ring, 'Carrion Wind', null, 0);
CarrionWind.addAttr(new Attribute(LifeSteal, 6, 9));
CarrionWind.addAttr(new Attribute(DefVsMisl, 100, 160));
const NaturesPeace = new Unique(Ring, 'Nature\'s Peace', null, 0);
NaturesPeace.addAttr(new Attribute(PsnRes, 20, 30));
NaturesPeace.addAttr(new Attribute(DmgReduce, 7, 11));
const WispProjector = new Unique(Ring, 'Wisp Projector', null, 0);
WispProjector.addAttr(new Attribute(LightAbsorbPerc, 10, 20));
WispProjector.addAttr(new Attribute(MagicFind, 10, 20));