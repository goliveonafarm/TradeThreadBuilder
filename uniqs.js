export class AttributeName {
  static attrArray = [];
  constructor(attrName, userAdded = false) {
    this._attrName = attrName;
    this._attrNickName = attrName;
    this._userAdded = userAdded;
    //false prevents custom fields from being changed
    this._editable = true;
    AttributeName.attrArray.push(this);
  }
  static resetNickNames() {
    this.attrArray = this.attrArray.filter(att => {
      return att._userAdded == false;
    })
    this.attrArray.forEach((element, index) => {
      if (element._editable) {
        element._attrNickName = element._attrName;
      }
    });
  }
  static setAttrNickName(index, string) {
    this.attrArray[index]._attrNickName = string;
  }
  static updateValues(newAttributeArray) {
    AttributeName.attrArray.forEach((element, index) => {
      element._attrNickName = newAttributeArray[index]._attrNickName;
    });
    console.log("updateValues() successful");
  }
}

export class BasicAttribute {
  constructor(attributeName, attrFloorMaxVal) {
    this._attributeName = attributeName;
    this._attrFloorActVal = attrFloorMaxVal;
    this._attrType = "basic";
  }
}

export class Attribute extends BasicAttribute {
  constructor(attributeName, attrFloorMinVal, attrFloorMaxVal) {
    super(attributeName, attrFloorMaxVal);
    this._attrFloorMinVal = attrFloorMinVal;
    this._attrFloorMaxVal = attrFloorMaxVal;
    this._attrFloorActVal = attrFloorMinVal;
    this._attrType = "attribute";
  }
}

export class SkillAttribute extends Attribute {
  constructor(
    attributeName,
    classOrTreeName,
    attrFloorMinVal,
    attrFloorMaxVal
  ) {
    super(attributeName, attrFloorMinVal, attrFloorMaxVal);
    this._classOrTreeName = classOrTreeName;
    this._attrType = "skillAttribute";
  }
}

export class TwoFieldAttribute extends Attribute {
  constructor(
    attributeName,
    attrFloorMinVal,
    attrFloorMaxVal,
    attrCeilMinVal,
    attrCeilMaxVal
  ) {
    super(attributeName, attrFloorMinVal, attrFloorMaxVal);
    this._attrCeilMinVal = attrCeilMinVal;
    this._attrCeilMaxVal = attrCeilMaxVal;
    this._attrCeilActVal = attrCeilMaxVal;
    this._attrType = "twoFieldAttribute";
  }
}

//Bases
export class Base {
  static baseArray = [];
  constructor(baseName, itemClass, tier) {
    this._name = baseName;
    this._itemClass = itemClass;
    this._tier = tier;
    this._isEth = false;
    this._ed = 0;
    this._sockets = 0;
    this._type = "Jewelry";
    Base.baseArray.push(this);
  }
}

export class Weapon extends Base {
  constructor(baseName, itemClass, tier, minDamage, maxDamage) {
    super(baseName, itemClass, tier);
    this._minDamage = minDamage;
    this._maxDamage = maxDamage;
    this._type = "Weapon";
  }
}

export class Armor extends Base {
  constructor(baseName, itemClass, tier, minDef, maxDef) {
    super(baseName, itemClass, tier);
    this._minDef = minDef;
    this._maxDef = maxDef;
    this._defActVal = maxDef;
    this._addedDef = 0;
    this._type = "Armor";
  }
  set defense(newDef) {
    this._defActVal = newDef;
  }
  get defense() {
    let ethMultiplier = this._isEth ? 1.5 : 1.0;
    if (this._ed === null) {
      this._defActVal = Math.floor(this._defActVal * ethMultiplier);
    } else {
      this._defActVal = Math.floor(
        parseFloat((this._defActVal + 1) * ethMultiplier) *
        (parseFloat(this._ed) * 0.01 + 1)
      );
    }
    return this._defActVal;
  }
}

export class Item {
  constructor(base) {
    this._base = JSON.parse(JSON.stringify(base));
    this._arr = [];
    this._name = base._name;
    this._magicClass = "Base";
    this._price = 0;
    this._customName = null;
    this._levelReq = 0;
  }
  addAttr(attr) {
    let g = attr._attributeName._attrName;
    if (g == "Enhanced Defense %") {
      if(!(this instanceof RuneWordItem)){
        this._base._ed = attr._attrFloorActVal;
        this._base._defActVal = this._base._maxDef;
      }
      if(this instanceof RuneWordItem){
        if(attr instanceof BasicAttribute){
          let ed = (parseFloat(attr._attrFloorActVal))/100;
          ed += 1;
          this._base._minDef = Math.floor(parseFloat(this._base._minDef * ed));
          this._base._maxDef = Math.floor(parseFloat(this._base._maxDef * ed));
          this._base._defActVal = this._base._maxDef;
        }
      }
    }
    if (g == "Defense") {
      this._base._addedDef = attr._attrFloorActVal;
    }
    if (g == "Level Requirement") {
      this._levelReq = attr._attrFloorActVal;
    }
    if (g == "Open Sockets") {
      this._base._sockets = attr._attrFloorActVal;
    }
    this._arr.push(attr);
    if (this._magicClass === "Base") { this.magicClass = "Magic" };

  }
}

export class Unique extends Item {
  static uniqueArr = [];
  constructor(base, name, ed, addedDef = 0) {
    super(base);
    this._name = name;
    this._base._ed = ed;
    this._base._addedDef = addedDef;
    this._magicClass = "Unique";
    Unique.uniqueArr.push(this);
  }
}

export class SetItem extends Unique {
  constructor(setItemBase, setItemName, setItemEd, setAddedDef, fullSetName){
    super(setItemBase, setItemName, setItemEd, setAddedDef);
    this._magicClass = "Set";
    this._fullSetName = fullSetName;
  }
}

export class RuneWordItem extends Item {
  constructor(base, runeWordArray) {
    super(base);
    this._name = `${runeWordArray._runeWordName} ${base._name}`;
    this._runeWordAttrArray = runeWordArray._runeWordAttrArray;
    this._magicClass = "Runeword";
    this.addRuneWordAttr();
  }
  addRuneWordAttr() {
    this._runeWordAttrArray.forEach(element => {
      this.addAttr(element);
    })
  }
}

let QuantizedItemIndexer = 0;
export class QuantizedItem extends Unique {
  constructor(base, name, ed, addedDef) {
    super(base, name, ed, addedDef);
    this.addAttr(new Attribute(ItemQuantity, 1, 99));
    this._quantizedIndex = QuantizedItemIndexer++;
    this._magicClass = "Misc";
  }
}

export class RuneWord {
  static RuneWordArray = [];
  constructor(runeWordName, runeWordAttrArray, possibleBases) {
    this._runeWordName = runeWordName;
    this._runeWordAttrArray = runeWordAttrArray;
    this._possibleBases = possibleBases;
    RuneWord.RuneWordArray.push(this);
  }
}

//#region attributes
const EnhancedDef = new AttributeName("Enhanced Defense %");
const EnhancedDmg = new AttributeName("Enhanced Damage %");
const Def = new AttributeName("Defense");
const Currency = new AttributeName("Forum Gold");
const Ar = new AttributeName("Attack Rating");
const ArPerc = new AttributeName("Attacking Rating %");
const ArUndead = new AttributeName("Attack Rating vs Undead +");
const ArDemon = new AttributeName("Attack Rating vs Demons +");
const ArAndED = new AttributeName("Attack Rating - Enhanced Damage");
const DmgDemon = new AttributeName("Damage to Demons %");
const DmgUndead = new AttributeName("Damage to Undead %");
const DefVsMisl = new AttributeName("Defense vs Missiles");
const ColdDmg = new AttributeName("Cold Damage");
const FireDmg = new AttributeName("Fire Damage");
const LightDmg = new AttributeName("Lightning Damage");
const PsnDmg = new AttributeName("Poison Damage");
const ColdDmgPerc = new AttributeName("Cold Damage +%");
const FireDmgPerc = new AttributeName("Fire Damage +%");
const LightDmgPerc = new AttributeName("Lightning Damage +%");
const PsntDmgPerc = new AttributeName("Poison Damage +%");
const AllRes = new AttributeName("All Resist %");
const ColdRes = new AttributeName("Cold Resist %");
const FireRes = new AttributeName("Fire Resist %");
const LightRes = new AttributeName("Lightning Resist %");
const PsnRes = new AttributeName("Poison Resist %");
const ColdAsbInt = new AttributeName("Cold Absorb");
const FireAsbInt = new AttributeName("Fire Absorb");
const LightAsbInt = new AttributeName("Lightning Absorb");
const ColdAbsorbPerc = new AttributeName("Cold Absorb %");
const FireAbsorbPerc = new AttributeName("Fire Absorb %");
const LightAbsorbPerc = new AttributeName("Lightning Absorb %");
const EnemyLightResist = new AttributeName("Enemy Lightning Reist -%");
const EnemyFireResist = new AttributeName("Enemy Fire Resist -%");
const EnemyColdResist = new AttributeName("Enemy Cold Resist-%");
const EnemyPsnResist = new AttributeName("Enemy Poison Resist -%");
const MaxDmg = new AttributeName("Maximum Damage");
const MinDmg = new AttributeName("Minimum Damage");
const StackSize = new AttributeName("Quantity");
const LightRad = new AttributeName("Light Radius");
const MagicFind = new AttributeName("Magic Find %");
const GoldFind = new AttributeName("Gold Find %");
const RedcVendPrices = new AttributeName("Reduces Vendor Prices %");
const Mana = new AttributeName("Mana");
const DmgToMana = new AttributeName("Damage Taken Goes to Mana %");
const ManaOnKill = new AttributeName("Mana After Each Kill");
const LifeOnKill = new AttributeName("Life After Each Kill");
const LifeOnDemonKill = new AttributeName("Life After Each Demon Kill");
const AllSkills = new AttributeName("All Skills");
const Skills = new AttributeName("Skills");
const ClassSkills = new AttributeName("Class Skills");
const ClassSkillTree = new AttributeName("Class Skill Tree");
const FCR = new AttributeName("Faster Cast Rate %");
const BlockAndFasterBlock = new AttributeName("Chance of Blocking - Faster Block Rate");
const IncrChanceBlockPerc = new AttributeName("Increase Chance to Block %");
const FHR = new AttributeName("Faster Hit Recovery");
const IAS = new AttributeName("Increased Attack Speed");
const DmgReduce = new AttributeName("Damage Reduced by");
const DmgReducePercent = new AttributeName("Damage Reduced by %");
const MageDmgReduce = new AttributeName("Magic Damage Reduced by");
const MageDmgReducePercent = new AttributeName("Magic Damage Reduced by");
const RunWalk = new AttributeName("Faster Run/Walk %");
const LifeSteal = new AttributeName("Life Stolen per Hit %");
const ManaSteal = new AttributeName("Mana Stolen per Hit %");
const LifeRegen = new AttributeName("Regenerate Life %");
const ManaRegen = new AttributeName("Regenerate Mana %");
const ReplLife = new AttributeName("Replenish Life");
const Dex = new AttributeName("Dexterity");
const Energy = new AttributeName("Energy");
const Life = new AttributeName("Life");
const Str = new AttributeName("Strength");
const Vit = new AttributeName("Vitality");
const HitFlee = new AttributeName("Hit causes Monster to Flee");
const MaxStam = new AttributeName("Maximum Stamina");
const IgnoreTgtDef = new AttributeName("Ignore Target Defense");
const Knockback = new AttributeName("Knockback");
const PrevMnstHeal = new AttributeName("Prevent Monster Heal");
const AttackerTakesDmg = new AttributeName("Attacker Takes Damage of");
const Repair = new AttributeName("Repairs 1 duarbility in seconds x");
const PsnLength = new AttributeName("Poison Length Reduced by %");
const LevelRequirement = new AttributeName("Level Requirement");
const Durability = new AttributeName("Durability");
const AllAttributes = new AttributeName("All Attributes +");
const ExperGained = new AttributeName("Experience Gained %");
const ItemQuantity = new AttributeName("x");
ItemQuantity._editable = false;
ItemQuantity._attrName = "Quantity";
const empty = new AttributeName("");
empty._editable = false;
empty._attrName = "Empty Value";
const Superior = new AttributeName("Superior");
const OpenSockets = new AttributeName("Open Sockets");
const emptyTwo = new AttributeName("");
emptyTwo._editable = false;
emptyTwo._attrName = "Custom val1";
const emptyThree = new AttributeName("");
emptyThree._editable = false;
emptyThree._attrName = "Custom val2";
const emptyFour = new AttributeName("");
emptyFour._editable = false;
emptyFour._attrName = "Custom val3";
const emptyFive = new AttributeName("");
emptyFive._editable = false;
emptyFive._attrName = "Custom val4";
const MagicAbsorb = new AttributeName("Magic Absorb")
const MagicDmg = new AttributeName("Magic Damage")
const Damage = new AttributeName("Damage")
const CrushingBlow = new AttributeName("Crushing Blow %")
const MaxLifePerc = new AttributeName("Increase Maximum Life %")
const emptySix = new AttributeName("");
emptySix._editable = false;
emptySix._attrName = "Empty Value 2";
console.log(AttributeName.attrArray)
const JawboneCap = new Armor("Jawbone Cap", "Barbarian Helm", "Normal", 10, 15);
const FangedHelm = new Armor("Fanged Helm", "Barbarian Helm", "Normal", 15, 20);
const HornedHelm = new Armor("Horned Helm", "Barbarian Helm", "Normal", 25, 30);
const AssaultHelmet = new Armor("Assault Helmet", "Barbarian Helm", "Normal", 30, 35);
const AvengerGuard = new Armor("Avenger Guard", "Barbarian Helm", "Normal", 35, 50);
const JawboneVisor = new Armor("Jawbone Visor", "Barbarian Helm", "Exceptional", 55, 68);
const LionHelm = new Armor("Lion Helm", "Barbarian Helm", "Exceptional", 63, 75);
const RageMask = new Armor("Rage Mask", "Barbarian Helm", "Exceptional", 78, 90);
const SavageHelmet = new Armor("Savage Helmet", "Barbarian Helm", "Exceptional", 85, 98);
const SlayerGuard = new Armor("Slayer Guard", "Barbarian Helm", "Exceptional", 93, 120);
const CarnageHelm = new Armor("Carnage Helm", "Barbarian Helm", "Elite", 102, 147);
const FuryVisor = new Armor("Fury Visor", "Barbarian Helm", "Elite", 105, 150);
const DestroyerHelm = new Armor("Destroyer Helm", "Barbarian Helm", "Elite", 111, 156);
const ConquerorCrown = new Armor("Conqueror Crown", "Barbarian Helm", "Elite", 114, 159);
const GuardianCrown = new Armor("Guardian Crown", "Barbarian Helm", "Elite", 117, 168);
const ArreatsFace = new Unique(SlayerGuard, "Arreats Face", 0, 0);
ArreatsFace.addAttr(new Attribute(EnhancedDef, 150, 200));
ArreatsFace.addAttr(new Attribute(LifeSteal, 3, 6));
const Wolfhowl = new Unique(FuryVisor, "Wolfhowl", 0);
Wolfhowl.addAttr(new Attribute(EnhancedDef, 120, 150));
Wolfhowl.addAttr(new SkillAttribute(empty, "Warcries", 2, 3));
Wolfhowl.addAttr(new SkillAttribute(empty, "Feral Rage", 3, 6));
Wolfhowl.addAttr(new SkillAttribute(empty, "Lycanthropy", 3, 6));
Wolfhowl.addAttr(new SkillAttribute(empty, "Werewolf", 3, 6));
const DemonhornsEdge = new Unique(DestroyerHelm, "Demonhorn's Edge", 0);
DemonhornsEdge.addAttr(new Attribute(EnhancedDef, 120, 150));
DemonhornsEdge.addAttr(new Attribute(LifeSteal, 3, 6));
DemonhornsEdge.addAttr(new Attribute(AttackerTakesDmg, 55, 77));
DemonhornsEdge.addAttr(new SkillAttribute(empty, "Warcries", 1, 3));
DemonhornsEdge.addAttr(new SkillAttribute(empty, "Combat Masteries", 1, 3));
DemonhornsEdge.addAttr(new SkillAttribute(empty, "Combat Skills", 1, 3));
const HalaberdsReign = new Unique(ConquerorCrown, "Halaberd's Reign", 0);
HalaberdsReign.addAttr(new Attribute(ReplLife, 15, 23));
HalaberdsReign.addAttr(new SkillAttribute(empty, "Battle Command", 1, 2));
HalaberdsReign.addAttr(new SkillAttribute(empty, "Battle Orders", 1, 2));

const Sash = new Armor("Sash", "Belt", "Normal", 2, 2);
const LightBelt = new Armor("Light Belt", "Belt", "Normal", 3, 3);
const Belt = new Armor("Belt", "Belt", "Normal", 5, 5);
const HeavyBelt = new Armor("Heavy Belt", "Belt", "Normal", 6, 6);
const PlatedBelt = new Armor("Plated Belt", "Belt", "Normal", 8, 11);
const DemonhideSash = new Armor("Demonhide Sash", "Belt", "Exceptional", 29, 34);
const SharkskinBelt = new Armor("Sharkskin Belt", "Belt", "Exceptional", 31, 36);
const MeshBelt = new Armor("Mesh Belt", "Belt", "Exceptional", 35, 40);
const BattleBelt = new Armor("Battle Belt", "Belt", "Exceptional", 37, 42);
const WarBelt = new Armor("War Belt", "Belt", "Exceptional", 41, 52);
const SpiderwebSash = new Armor("Spiderweb Sash", "Belt", "Elite", 55, 62);
const VampirefangBelt = new Armor("Vampirefang Belt", "Belt", "Elite", 56, 63);
const MithrilCoil = new Armor("Mithril Coil", "Belt", "Elite", 58, 65);
const TrollBelt = new Armor("Troll Belt", "Belt", "Elite", 59, 66);
const ColossusGirdle = new Armor("Colossus Girdle", "Belt", "Elite", 61, 71);
const LenymoSash = new Unique(Sash, "Lenymo Sash", 0, 0)
const Snakecord = new Unique(LightBelt, "Snakecord", 0, 10);
Snakecord.addAttr(new Attribute(EnhancedDef, 20, 30));
const NightSmoke = new Unique(Belt, "Nightsmoke", 0, 15);
NightSmoke.addAttr(new Attribute(EnhancedDef, 30, 50));
const GoldWrap = new Unique(HeavyBelt, "Gold Wrap", 0, 25);
GoldWrap.addAttr(new Attribute(EnhancedDef, 40, 60));
GoldWrap.addAttr(new Attribute(GoldFind, 50, 80));
const Bladebuckle = new Unique(PlatedBelt, "Bladebuckle", 0, 30);
Bladebuckle.addAttr(new Attribute(EnhancedDef, 80, 100));
const StringOfEars = new Unique(DemonhideSash, "String of Ears", 0, 15);
StringOfEars.addAttr(new Attribute(EnhancedDef, 150, 180));
StringOfEars.addAttr(new Attribute(LifeSteal, 6, 8));
StringOfEars.addAttr(new Attribute(DmgReducePercent, 10, 15));
StringOfEars.addAttr(new Attribute(MageDmgReduce, 10, 15));
const Razortail = new Unique(SharkskinBelt, "Razortail", 0, 15);
Razortail.addAttr(new Attribute(EnhancedDef, 120, 150));
const GloomsTrap = new Unique(MeshBelt, "Gloom's Trap", 0, 0);
GloomsTrap.addAttr(new Attribute(EnhancedDef, 120, 150));
const Snowclash = new Unique(BattleBelt, "Snowclash", 0, 0);
Snowclash.addAttr(new Attribute(EnhancedDef, 130, 170));
const Thundergods = new Unique(WarBelt, "Thundergod's Vigor", 0, 0);
Thundergods.addAttr(new Attribute(EnhancedDef, 160, 200));
const ArachnidMesh = new Unique(SpiderwebSash, "Arachnid Mesh", 0, 0);
ArachnidMesh.addAttr(new Attribute(EnhancedDef, 90, 120));
const NosferatusCoil = new Unique(VampirefangBelt, "Nosferatu's Coil", 0, 0);
const VerdungosHeartyCord = new Unique(MithrilCoil, "Verdungos Heraty Cord", 0, 0);
VerdungosHeartyCord.addAttr(new Attribute(EnhancedDef, 90, 140));
VerdungosHeartyCord.addAttr(new Attribute(Vit, 30, 40));
VerdungosHeartyCord.addAttr(new Attribute(ReplLife, 10, 13));
VerdungosHeartyCord.addAttr(new Attribute(MaxStam, 100, 120));
VerdungosHeartyCord.addAttr(new Attribute(DmgReducePercent, 10, 15));

const QuiltedArmor = new Armor("Quilted Armor", "Armor", "Normal", 8, 11);
const LeatherArmor = new Armor("Leather Armor", "Armor", "Normal", 14, 17);
const HardLeatherArmor = new Armor("Hard Leather Armor", "Armor", "Normal", 21, 24);
const StuddedLeather = new Armor("Studded Leather", "Armor", "Normal", 32, 35);
const RingMail = new Armor("Ring Mail", "Armor", "Normal", 45, 48);
const ScaleMail = new Armor("Scale Mail", "Armor", "Normal", 57, 60);
const BreastPlate = new Armor("Breast Plate", "Armor", "Normal", 65, 68);
const ChainMail = new Armor("Chain Mail", "Armor", "Normal", 72, 75);
const SplintMail = new Armor("Splint Mail", "Armor", "Normal", 90, 95);
const LightPlate = new Armor("Light Plate", "Armor", "Normal", 90, 107);
const FieldPlate = new Armor("Field Plate", "Armor", "Normal", 101, 105);
const PlateMail = new Armor("Plate Mail", "Armor", "Normal", 108, 116);
const GothicPlate = new Armor("Gothic Plate", "Armor", "Normal", 128, 135);
const FullPlateMail = new Armor("Full Plate Mail", "Armor", "Normal", 150, 161)
const AncientArmor = new Armor("Ancient Armor", "Armor", "Normal", 208, 233);
const GhostArmor = new Armor("Ghost Armor", "Armor", "Exceptional", 102, 117);
const Serpentskin = new Armor("Serpentskin Armor", "Armor", "Exceptional", 111, 126);
const DemonhideArmor = new Armor("Demonhide Armor", "Armor", "Exceptional", 122, 136);
const TrellisedArmor = new Armor("Trellised Armor", "Armor", "Exceptional", 138, 15);
const LinkedMail = new Armor("Linked Mail", "Armor", "Exceptional", 158, 172);
const TigulatedMail = new Armor("Tigulated Mail", "Armor", "Exceptional", 176, 190);
const Cuirass = new Armor("Cuirass", "Armor", "Exceptional", 188, 202);
const MeshArmor = new Armor("Mesh Armor", "Armor", "Exceptional", 198, 213);
const RussetArmor = new Armor("Russet Armor", "Armor", "Exceptional", 225, 243);
const MagePlate = new Armor("Mage Plate", "Armor", "Exceptional", 225, 261);
const SharktoothArmor = new Armor("Sharktooth Armor", "Armor", "Exceptional", 242, 258);
const TemplarCoat = new Armor("Templar Coat", "Armor", "Exceptional", 252, 274);
const EmbossedPlate = new Armor("Embossed Plate", "Armor", "Exceptional", 282, 303);
const ChaosArmor = new Armor("Chaos Armor", "Armor", "Exceptional", 315, 342);
const OrnatePlate = new Armor("Ornate Plate", "Armor", "Exceptional", 417, 450);
const DuskShroud = new Armor("Dusk Shroud", "Armor", "Elite", 361, 467);
const Wyrmhide = new Armor("Wyrmhide", "Armor", "Elite", 364, 470);
const ScarabHusk = new Armor("Scarab Husk", "Armor", "Elite", 369, 474);
const WireFleece = new Armor("Wire Fleece", "Armor", "Elite", 375, 481);
const DiamondMail = new Armor("Diamond Mail", "Armor", "Elite", 383, 489);
const LoricatedMail = new Armor("Loricated mail", "Armor", "Elite", 390, 496);
const GreatHauberk = new Armor("Great Hauberk", "Armor", "Elite", 395, 501);
const Boneweave = new Armor("Boneweave", "Armor", "Elite", 399, 505);
const BalrogSkin = new Armor("Balrog Skin", "Armor", "Elite", 410, 517);
const ArchonPlate = new Armor("Archon Plate", "Armor", "Elite", 410, 524);
const KrakenShell = new Armor("Kraken Shell", "Armor", "Elite", 417, 523);
const HellforgePlate = new Armor("Hellforge Plate", "Armor", "Elite", 421, 530);
const LacqueredPlate = new Armor("LacqueredPlate", "Armor", "Elite", 433, 541);
const ShadowPlate = new Armor("Shadow Plate", "Armor", "Elite", 446, 557);
const SacredArmor = new Armor("Sacred Armor", "Armor", "Elite", 487, 600);
const Greyform = new Unique(QuiltedArmor, "Greyform", 0, 20);
const BlinkbatsForm = new Unique(LeatherArmor, "Blinkbat's Form", 0, 25);
const Centurion = new Unique(HardLeatherArmor, "Centurion", 0, 30);
const Twitchthroe = new Unique(StuddedLeather, "Twitchthroe", 0, 25);
const Darkglow = new Unique(RingMail, "Darkglow", 0, 0);
Darkglow.addAttr(new Attribute(EnhancedDef, 70, 100));
const Hawkmail = new Unique(ScaleMail, "Hawmail", 0, 0);
Hawkmail.addAttr(new Attribute(EnhancedDef, 80, 100));
const VenomWard = new Unique(BreastPlate, "Venom Ward", 0, 0);
VenomWard.addAttr(new Attribute(EnhancedDef, 60, 100));
const SparklingMail = new Unique(ChainMail, "SparklingMail", 0, 0);
SparklingMail.addAttr(new Attribute(EnhancedDef, 75, 85));
const Iceblink = new Unique(SplintMail, "Iceblink", 0, 0);
Iceblink.addAttr(new Attribute(EnhancedDef, 70, 80));
const HeavenlyGarb = new Unique(LightPlate, "Heavenly Garb", 100, 0);
const Boneflesh = new Unique(PlateMail, "Boneflesh", 0, 0);
Boneflesh.addAttr(new Attribute(EnhancedDef, 100, 120));
const Rockfleece = new Unique(FieldPlate, "Rockfleece", 0, 0);
Rockfleece.addAttr(new Attribute(EnhancedDef, 100, 130))
const Rattlecage = new Unique(GothicPlate, "Rattlecage", 0, 200);
const Goldskin = new Unique(FullPlateMail, "Goldskin", 0, 0);
const SilksOfTheVictor = new Unique(AncientArmor, "Silks of the Victor", 0, 0);
SilksOfTheVictor.addAttr(new Attribute(EnhancedDef, 100, 120));
const SpiritShroud = new Unique(GhostArmor, "The Spirit Shroud", 150, 0);
const SkinOfTheViperMagi = new Unique(Serpentskin, "Skin of the Vipermagi", 120, 0);
SkinOfTheViperMagi.addAttr(new Attribute(MageDmgReduce, 9, 13));
const SkinOfTheFlayedOne = new Unique(DemonhideArmor, "Skin of the Flayed One", 0, 0);
SkinOfTheFlayedOne.addAttr(new Attribute(EnhancedDef, 150, 190));
SkinOfTheFlayedOne.addAttr(new Attribute(LifeSteal, 5, 7));
SkinOfTheFlayedOne.addAttr(new Attribute(ReplLife, 15, 25));
const IronPelt = new Unique(TrellisedArmor, "Iron Pelt", 0, 0);
IronPelt.addAttr(new Attribute(EnhancedDef, 50, 100));
IronPelt.addAttr(new Attribute(DmgReduce, 15, 20));
IronPelt.addAttr(new Attribute(MageDmgReduce, 15, 20));
const CrowCaw = new Unique(TigulatedMail, "Crow Caw", 0, 0);
CrowCaw.addAttr(new Attribute(EnhancedDef, 150, 180));
const SpiritForge = new Unique(LinkedMail, "Spirit Forge", 0, 0);
SpiritForge.addAttr(new Attribute(EnhancedDef, 120, 160));
const DurielsShell = new Unique(Cuirass, "Duriels Shell", 0, 0);
DurielsShell.addAttr(new Attribute(EnhancedDef, 160, 200));
const Shaftstop = new Unique(MeshArmor, "Shaftstop", 0, 0);
Shaftstop.addAttr(new Attribute(EnhancedDef, 180, 220));
const SkuldersIre = new Unique(RussetArmor, "Skulder's Ire", 0, 0);
SkuldersIre.addAttr(new Attribute(EnhancedDef, 160, 200));
const QueHegans = new Unique(MagePlate, "Que-Hegan's Wisdom", 0, 0);
QueHegans.addAttr(new Attribute(EnhancedDef, 140, 160));
QueHegans.addAttr(new Attribute(MageDmgReduce, 6, 10));
const GuardianAngel = new Unique(TemplarCoat, "Guardian Angel", 0, 0);
GuardianAngel.addAttr(new Attribute(EnhancedDef, 180, 200));
const Toothrow = new Unique(SharktoothArmor, "Toothrow", 0, 0);
Toothrow.addAttr(new Attribute(EnhancedDef, 160, 220));
Toothrow.addAttr(new Attribute(Def, 40, 60));
Toothrow.addAttr(new Attribute(AttackerTakesDmg, 20, 40));
const AtmasWail = new Unique(EmbossedPlate, "Atma's Wail", 0, 0);
AtmasWail.addAttr(new Attribute(EnhancedDef, 120, 160));
const BlackHades = new Unique(ChaosArmor, "Black Hades", 0, 0);
BlackHades.addAttr(new Attribute(EnhancedDef, 140, 200));
BlackHades.addAttr(new Attribute(DmgDemon, 30, 60));
BlackHades.addAttr(new Attribute(Ar, 200, 250));
const Corpsemourn = new Unique(OrnatePlate, "Corpsemourn", 0, 0);
Corpsemourn.addAttr(new Attribute(EnhancedDef, 150, 180));
const OrmusRobes = new Unique(DuskShroud, "Ormus' Robes", 0, 0);
OrmusRobes.addAttr(new Attribute(Def, 10, 20));
OrmusRobes.addAttr(new Attribute(ColdDmgPerc, 10, 15));
OrmusRobes.addAttr(new Attribute(FireDmgPerc, 10, 15));
OrmusRobes.addAttr(new Attribute(LightDmgPerc, 10, 15));
OrmusRobes.addAttr(new Attribute(ManaRegen, 10, 15));
OrmusRobes.addAttr(new SkillAttribute(empty, "Enter Skill", "", ""))

const GladiatorsBane = new Unique(WireFleece, "Gladiator's Bane", 0, 50);
GladiatorsBane.addAttr(new Attribute(EnhancedDef, 150, 200));
GladiatorsBane.addAttr(new Attribute(DmgReduce, 15, 20));
GladiatorsBane.addAttr(new Attribute(MageDmgReduce, 15, 20));
const ArkainesValor = new Unique(BalrogSkin, "Arkaine's Valor", 0, 0);
ArkainesValor.addAttr(new Attribute(EnhancedDef, 150, 180));
ArkainesValor.addAttr(new Attribute(Skills, 1, 2));
ArkainesValor.addAttr(new Attribute(DmgReduce, 10, 15));
const Leviathan = new Unique(KrakenShell, "Leviathan", 0, 0);
Leviathan.addAttr(new Attribute(EnhancedDef, 170, 200));
Leviathan.addAttr(new Attribute(Def, 100, 150));
Leviathan.addAttr(new Attribute(Str, 40, 50));
Leviathan.addAttr(new Attribute(DmgReducePercent, 15, 25));
const SteelCarapace = new Unique(ShadowPlate, "Steel Carapace", 0);
SteelCarapace.addAttr(new Attribute(EnhancedDef, 190, 220));
SteelCarapace.addAttr(new Attribute(ManaRegen, 10, 15));
SteelCarapace.addAttr(new Attribute(ColdRes, 40, 60));
SteelCarapace.addAttr(new Attribute(DmgReduce, 9, 14));
const TemplarsMight = new Unique(SacredArmor, "Templar's Might", 0);
TemplarsMight.addAttr(new Attribute(EnhancedDef, 170, 220));
TemplarsMight.addAttr(new Attribute(DefVsMisl, 250, 300));
TemplarsMight.addAttr(new Attribute(Str, 10, 15));
TemplarsMight.addAttr(new Attribute(Vit, 10, 15));
TemplarsMight.addAttr(new Attribute(MaxStam, 40, 50));
TemplarsMight.addAttr(new SkillAttribute(ClassSkillTree, "Offensive Auras", 1, 2));
const TyraelsMight = new Unique(SacredArmor, "Tyrael's Might", 0);
TyraelsMight.addAttr(new Attribute(EnhancedDef, 120, 150));
TyraelsMight.addAttr(new Attribute(DmgDemon, 50, 100));
TyraelsMight.addAttr(new Attribute(Str, 20, 30));
TyraelsMight.addAttr(new Attribute(AllRes, 20, 30));

const Boots = new Armor("Boots", "Boots", "Normal", 2, 3);
const HeavyBoots = new Armor("Heavy Boots", "Boots", "Normal", 5, 6);
const ChainBoots = new Armor("Chain Boots", "Boots", "Normal", 8, 9);
const LightPlatedBoots = new Armor("Light Plated Boots", "Boots", "Normal", 9, 11);
const Greaves = new Armor("Greaves", "Boots", "Normal", 12, 15);
const DemonhideBoots = new Armor("Demonhide Boots", "Boots", "Exceptional", 28, 35);
const SharkskinBoots = new Armor("Sharkskin Boots", "Boots", "Exceptional", 33, 39);
const MeshBoots = new Armor("Mesh Boots", "Boots", "Exceptional", 37, 44);
const BattleBoots = new Armor("Battle Boots", "Boots", "Exceptional", 39, 47);
const WarBoots = new Armor("War Boots", "Boots", "Exceptional", 43, 53);
const WyrmhideBoots = new Armor("Wyrmhide Boots", "Boots", "Elite", 54, 62);
const ScarabshellBoots = new Armor("Scarabshell Boots", "Boots", "Elite", 56, 65);
const BoneweaveBoots = new Armor("Boneweave Boots", "Boots", "Elite", 59, 67);
const MirroredBoots = new Armor("Mirrored Boots", "Boots", "Elite", 59, 68)
const MyrmidonGreaves = new Armor("Myrmidon Greaves", "Boots", "Elite", 62, 71);
const Hotspur = new Unique(Boots, "Hotspur", 0, 6);
Hotspur.addAttr(new Attribute(EnhancedDef, 10, 20));
const Gorefoot = new Unique(HeavyBoots, "Gorefoot", 0, 0);
Gorefoot.addAttr(new Attribute(EnhancedDef, 20, 30));
const TreadsOfCthon = new Unique(ChainBoots, "Treads of Cthon", 0, 12);
TreadsOfCthon.addAttr(new Attribute(EnhancedDef, 30, 40));
const GoblinToe = new Unique(LightPlatedBoots, "Goblin Toe", 0, 15);
GoblinToe.addAttr(new Attribute(EnhancedDef, 60, 80));
const Tearhaunch = new Unique(Greaves, "Tearhaunch", 60, 80, 35);
Tearhaunch.addAttr(new Attribute(EnhancedDef, 60, 80));
const Infernostride = new Unique(DemonhideBoots, "Infernostride", 0, 15);
Infernostride.addAttr(new Attribute(EnhancedDef, 120, 150));
Infernostride.addAttr(new Attribute(GoldFind, 40, 70));
const Waterwalk = new Unique(SharkskinBoots, "Waterwalk", 0, 0);
Waterwalk.addAttr(new Attribute(EnhancedDef, 180, 210));
Waterwalk.addAttr(new Attribute(Life, 45, 65));
const Silkweave = new Unique(MeshBoots, "Silkweave", 0, 0);
Silkweave.addAttr(new Attribute(EnhancedDef, 150, 190));
const WarTraveler = new Unique(BattleBoots, "War Traveler", 0, 0);
WarTraveler.addAttr(new Attribute(EnhancedDef, 150, 190));
WarTraveler.addAttr(new Attribute(AttackerTakesDmg, 5, 10));
WarTraveler.addAttr(new Attribute(MagicFind, 30, 50));
const GoreRider = new Unique(WarBoots, "Gore Rider", 0, 0);
GoreRider.addAttr(new Attribute(EnhancedDef, 160, 200));
const SandstormTrek = new Unique(ScarabshellBoots, "Sandstorm Trek", 0, 0);
SandstormTrek.addAttr(new Attribute(EnhancedDef, 140, 170));
SandstormTrek.addAttr(new Attribute(Str, 10, 15));
SandstormTrek.addAttr(new Attribute(Vit, 10, 15));
SandstormTrek.addAttr(new Attribute(PsnRes, 40, 70));
const Marrowwalk = new Unique(BoneweaveBoots, "Marrowwalk", 0, 0);
Marrowwalk.addAttr(new Attribute(EnhancedDef, 170, 200));
Marrowwalk.addAttr(new SkillAttribute(empty, "Skeleton Mastery", 1, 2));
Marrowwalk.addAttr(new Attribute(Str, 10, 20));
const ShadowDancer = new Unique(MyrmidonGreaves, "Shadow Dancer", 0, 0);
ShadowDancer.addAttr(new Attribute(EnhancedDef, 70, 100));
ShadowDancer.addAttr(new SkillAttribute(empty, "Shadow Disciplines", 1, 2));
ShadowDancer.addAttr(new Attribute(Dex, 15, 25));

const Circlet = new Armor("Circlet", "Circlet", "Elite", 20, 30);
const Coronet = new Armor("Coronet", "Circlet", "Elite", 30, 40);
const Tiara = new Armor("Tiara", "Circlet", "Elite", 40, 50);
const Diadem = new Armor("Diadem", "Circlet", "Elite", 50, 60);
const KirasGuardian = new Unique(Tiara, "Kira's Guardian", 0, 0);
KirasGuardian.addAttr(new Attribute(Def, 50, 120));
KirasGuardian.addAttr(new Attribute(AllRes, 50, 70));
const GriffonsEye = new Unique(Diadem, "Griffon's Eye", 0, 0);
GriffonsEye.addAttr(new Attribute(Def, 50, 120));
GriffonsEye.addAttr(new Attribute(EnemyLightResist, 15, 20));
GriffonsEye.addAttr(new Attribute(LightDmg, 10, 15));

const WolfHead = new Armor("Wolf Head", "Druid Pelt", "Normal", 8, 11);
const HawkHelm = new Armor("Hawk Helm", "Druid Pelt", "Normal", 4, 15);
const Antlers = new Armor("Antlers", "Druid Pelt", "Normal", 18, 24);
const FalconMask = new Armor("Falcon Mask", "Druid Pelt", "Normal", 12, 28);
const SpiritMask = new Armor("Spirit Mask", "Druid Pelt", "Normal", 22, 35);
const AlphaHelm = new Armor("Alpha Helm", "Druid Pelt", "Exceptional", 52, 62);
const GriffonHeaddress = new Armor("Griffon Headdress", "Druid Pelt", "Exceptional", 46, 68);
const HuntersGuise = new Armor("Hunter's Guise", "Druid Pelt", "Exceptional", 67, 81);
const SacredFeathers = new Armor("Sacred Feathers", "Druid Pelt", "Exceptional", 58, 87);
const TotemicMask = new Armor("Totemic Mask", "Druid Pelt", "Exceptional", 73, 9);
const BloodSpirit = new Armor("Blood Spirit", "Druid Pelt", "Elite", 101, 145);
const SunSpirit = new Armor("Sun Spirit", "Druid Pelt", "Elite", 67, 81);
const EarthSpirit = new Armor("Earth Spirit", "Druid Pelt", "Elite", 107, 152);
const SkySpirit = new Armor("Sky Spirit", "Druid Pelt", "Elite", 103, 155);
const DreamSpirit = new Armor("Dream Spirit", "Druid Pelt", "Elite", 109, 159);
const JalalsMane = new Unique(TotemicMask, "Jalal's Mane", 0, 0);
JalalsMane.addAttr(new Attribute(EnhancedDef, 150, 200));
const CerebusBite = new Unique(BloodSpirit, "Cerebus' Bite", 0, 0);
CerebusBite.addAttr(new Attribute(EnhancedDef, 130, 140));
CerebusBite.addAttr(new Attribute(ArPerc, 60, 120));
CerebusBite.addAttr(new Attribute(LifeSteal, 7, 10));
CerebusBite.addAttr(new SkillAttribute(empty, "Shape Shifting Skills", 2, 4));
CerebusBite.addAttr(new SkillAttribute(empty, "Feral Rage", 1, 2));
const Ravenlore = new Unique(SkySpirit, "Ravenlore", 0, 0);
Ravenlore.addAttr(new Attribute(EnhancedDef, 120, 150));
Ravenlore.addAttr(new Attribute(Energy, 20, 30));
Ravenlore.addAttr(new Attribute(EnemyFireResist, 10, 20));
Ravenlore.addAttr(new Attribute(AllRes, 15, 25));
const SpiritKeeper = new Unique(EarthSpirit, "Spirit Keeper", 0, 0);
SpiritKeeper.addAttr(new Attribute(EnhancedDef, 170, 190));
SpiritKeeper.addAttr(new SkillAttribute(ClassSkills, "Druid", 1, 2));
SpiritKeeper.addAttr(new Attribute(FireRes, 30, 40));
SpiritKeeper.addAttr(new Attribute(LightAsbInt, 9, 14));
SpiritKeeper.addAttr(new Attribute(ColdAbsorbPerc, 15, 25));

const LeatherGloves = new Armor("Leather Gloves", "Gloves", "Normal", 2, 3);
const HeavyGloves = new Armor("Heavy Gloves", "Gloves", "Normal", 5, 6);
const ChainGloves = new Armor("Chain Gloves", "Gloves", "Normal", 8, 9);
const LightGauntlets = new Armor("Light Gauntlets", "Gloves", "Normal", 9, 11);
const Gauntlets = new Armor("Gauntlets", "Gloves", "Normal", 12, 15);
const DemonhideGloves = new Armor("Demonhide Gloves", "Gloves", "Exceptional", 28, 35);
const SharkskinGloves = new Armor("Sharkskin Gloves", "Gloves", "Exceptional", 33, 39);
const HeavyBracers = new Armor("Heavy Bracers", "Gloves", "Exceptional", 37, 44);
const BattleGauntlets = new Armor("Battle Gauntlets", "Gloves", "Exceptional", 39, 47);
const WarGauntlets = new Armor("War Gauntlets", "Gloves", "Exceptional", 43, 53);
const BrambleMitts = new Armor("Bramble Mitts", "Gloves", "Elite", 54, 62);
const VampireboneGloves = new Armor("Vampirebone Gloves", "Gloves", "Elite", 56, 65);
const Vambraces = new Armor("Vambraces", "Gloves", "Elite", 59, 67);
const CrusaderGauntlets = new Armor("Crusader Gauntlets", "Gloves", "Elite", 59, 68);
const OgreGauntlets = new Armor("Ogre Gauntlets", "Gloves", "Elite", 62, 71);
const HandOfBroc = new Unique(LeatherGloves, "HandOfBroc", 0, 10);
const Bloodfist = new Unique(HeavyGloves, "Bloodfist", 0, 10);
Bloodfist.addAttr(new Attribute(EnhancedDef, 10, 20));
const ChanceGuards = new Unique(ChainGloves, "Chance Guards", 0, 15);
ChanceGuards.addAttr(new Attribute(EnhancedDef, 20, 30));
ChanceGuards.addAttr(new Attribute(MagicFind, 25, 40));
const Magefist = new Unique(LightGauntlets, "Magefist", 0, 10);
Magefist.addAttr(new Attribute(EnhancedDef, 20, 30));
const Frostburn = new Unique(Gauntlets, "Frostburn", 0, 30);
Frostburn.addAttr(new Attribute(EnhancedDef, 10, 20));
const VenomGrip = new Unique(DemonhideGloves, "Venom Grip", 0, 0);
VenomGrip.addAttr(new Attribute(EnhancedDef, 130, 160));
VenomGrip.addAttr(new Attribute(Def, 15, 25));
const GravePalm = new Unique(SharkskinGloves, "Gravepalm", 0, 0);
GravePalm.addAttr(new Attribute(EnhancedDef, 140, 180));
GravePalm.addAttr(new Attribute(DmgUndead, 100, 200));
GravePalm.addAttr(new Attribute(ArUndead, 100, 200));
const Ghoulhide = new Unique(HeavyBracers, "Ghoulhide", 0, 0);
Ghoulhide.addAttr(new Attribute(EnhancedDef, 150, 190));
Ghoulhide.addAttr(new Attribute(ManaSteal, 4, 5));
const LavaGout = new Unique(BattleGauntlets, "Lava Gout", 0, 0);
LavaGout.addAttr(new Attribute(EnhancedDef, 150, 200));
const Hellmouth = new Unique(WarGauntlets, "Hellmouth", 0, 0);
Hellmouth.addAttr(new Attribute(EnhancedDef, 150, 200));
const DraculsGrasp = new Unique(VampireboneGloves, "Draculs Grasp", 0, 0);
DraculsGrasp.addAttr(new Attribute(EnhancedDef, 90, 120));
DraculsGrasp.addAttr(new Attribute(Str, 10, 15));
DraculsGrasp.addAttr(new Attribute(LifeOnKill, 5, 10));
DraculsGrasp.addAttr(new Attribute(LifeSteal, 7, 10));
const SoulDrainer = new Unique(Vambraces, "Soul Drainer", 0, 0);
SoulDrainer.addAttr(new Attribute(EnhancedDef, 90, 120));
SoulDrainer.addAttr(new Attribute(ManaSteal, 4, 7));
SoulDrainer.addAttr(new Attribute(LifeSteal, 4, 7));
const Steelrend = new Unique(OgreGauntlets, "Steelrend", 0, 0);
Steelrend.addAttr(new Attribute(Def, 170, 210));
Steelrend.addAttr(new Attribute(EnhancedDmg, 30, 60));
Steelrend.addAttr(new Attribute(Str, 15, 20));

const Cap = new Armor("Cap", "Helm", "Normal", 3, 5);
const SkullCap = new Armor("Skull Cap", "Helm", "Normal", 8, 11);
const Helm = new Armor("Helm", "Helm", "Normal", 15, 18);
const FullHelm = new Armor("Full Helm", "Helm", "Normal", 23, 26);
const GreatHelm = new Armor("Great Helm", "Helm", "Normal", 30, 35);
const Mask = new Armor("Mask", "Helm", "Normal", 9, 27);
const Crown = new Armor("Crown", "Helm", "Normal", 25, 45);
const BoneHelm = new Armor("Bonehelm", "Helm", "Normal", 33, 36);
const WarHat = new Armor("War Hat", "Helm", "Exceptional", 45, 53);
const Sallet = new Armor("Sallet", "Helm", "Exceptional", 52, 62);
const Casque = new Armor("Casque", "Helm", "Exceptional", 63, 72);
const Basinet = new Armor("Basinet", "Helm", "Exceptional", 75, 84);
const WingedHelm = new Armor("Winged Helm", "Helm", "Normal", 85, 98);
const DeathMask = new Armor("Death Mask", "Helm", "Exceptional", 54, 86);
const GrandCrown = new Armor("Grand Crown", "Helm", "Exceptional", 78, 113);
const GrimHelm = new Armor("Grim Helm", "Helm", "Exceptional", 60, 125);
const Shako = new Armor("Shako", "Helm", "Elite", 98, 141);
const Hydraskull = new Armor("Hydraskull", "Helm", "Elite", 101, 145);
const Armet = new Armor("Armet", "Helm", "Elite", 105, 149);
const GiantConch = new Armor("Giant Conch", "Helm", "Elite", 101, 154);
const SpiredHelm = new Armor("Spired Helm", "Helm", "Elite", 114, 159);
const Demonhead = new Armor("Demonhead", "Helm", "Elite", 101, 154);
const Corona = new Armor("Corona", "Helm", "Elite", 111, 165);
const BoneVisage = new Armor("Bone Visage", "Helm", "Elite", 100, 157);
const BiggonsBonnet = new Unique(Cap, "Biggin's Bonnet", 30, 14);
const Tarnhelm = new Unique(SkullCap, "Tarnhelm", 0, 0);
Tarnhelm.addAttr(new Attribute(MagicFind, 25, 50));
const CoifOfGlory = new Unique(Helm, "Coif of Glory", 0, 10);
const Duskdeep = new Unique(FullHelm, "Duskdeep", 0, 11);
Duskdeep.addAttr(new Attribute(EnhancedDef, 30, 50));
Duskdeep.addAttr(new Attribute(Def, 10, 20));
const Howltusk = new Unique(GreatHelm, "Howltusk", 80, 0);
const TheFaceOfHorror = new Unique(Mask, "Face of Horror", 0, 25);
const UndeadCrown = new Unique(Crown, "Undead Crown", 0, 40);
UndeadCrown.addAttr(new Attribute(EnhancedDef, 30, 60));
UndeadCrown.addAttr(new Attribute(ArUndead, 50, 100));
const Wormskull = new Unique(BoneHelm, "Wormskull", 0, 0);
const PeasantCrown = new Unique(WarHat, "Peasant Crown", 100, 0);
PeasantCrown.addAttr(new Attribute(ReplLife, 6, 12));
const Rockstopper = new Unique(Sallet, "Rockstopper", 0, 0);
Rockstopper.addAttr(new Attribute(EnhancedDef, 160, 220));
Rockstopper.addAttr(new Attribute(ColdRes, 20, 40));
Rockstopper.addAttr(new Attribute(FireRes, 20, 50));
Rockstopper.addAttr(new Attribute(LightRes, 20, 40));
const Stealskull = new Unique(Casque, "Stealskull", 0, 0);
Stealskull.addAttr(new Attribute(EnhancedDef, 200, 240));
Stealskull.addAttr(new Attribute(MagicFind, 30, 50));
const DarksightHelm = new Unique(Basinet, "Darksight Helm", 0, 0);
DarksightHelm.addAttr(new Attribute(FireRes, 20, 40));
const ValkyrieWing = new Unique(WingedHelm, "Valkyrie Wing", 0, 0);
ValkyrieWing.addAttr(new Attribute(EnhancedDef, 150, 200));
ValkyrieWing.addAttr(new SkillAttribute(empty, "Amazon Skills", 1, 2));
ValkyrieWing.addAttr(new Attribute(ManaOnKill, 2, 4));
const BlackhornsFace = new Unique(DeathMask, "Death Mask", 0, 0);
BlackhornsFace.addAttr(new Attribute(EnhancedDef, 180, 220));
const CrownOfThieves = new Unique(GrandCrown, "Crown of Thieves", 0, 0);
CrownOfThieves.addAttr(new Attribute(EnhancedDef, 160, 200));
CrownOfThieves.addAttr(new Attribute(LifeSteal, 9, 12));
const VampireGaze = new Unique(GrimHelm, "Vampire Gaze", 100, 0);
VampireGaze.addAttr(new Attribute(LifeSteal, 6, 8));
VampireGaze.addAttr(new Attribute(ManaSteal, 6, 8));
VampireGaze.addAttr(new Attribute(DmgReducePercent, 15, 20));
VampireGaze.addAttr(new Attribute(MageDmgReduce, 10, 15));
const HarlequinCrest = new Unique(Shako, "Shako Harlequin Crest", 0, 0);
const SteelShade = new Unique(Armet, "Steel Shade", 0, 0);
SteelShade.addAttr(new Attribute(EnhancedDef, 100, 130));
SteelShade.addAttr(new Attribute(ReplLife, 10, 18));
SteelShade.addAttr(new Attribute(ManaSteal, 4, 8));
SteelShade.addAttr(new Attribute(FireAsbInt, 5, 11));
const VeilOfSteel = new Unique(SpiredHelm, "Veil of Steel", 60, 140);
const NightwingsVeil = new Unique(SpiredHelm, "Nightwing's Veil", 0, 0);
NightwingsVeil.addAttr(new Attribute(EnhancedDef, 90, 120));
NightwingsVeil.addAttr(new Attribute(ColdDmg, 8, 15));
NightwingsVeil.addAttr(new Attribute(Dex, 10, 20));
NightwingsVeil.addAttr(new Attribute(ColdAsbInt, 5, 9));
const AndarielsVisage = new Unique(Demonhead, "Andariel's Visage", 0, 0);
AndarielsVisage.addAttr(new Attribute(EnhancedDef, 100, 150));
AndarielsVisage.addAttr(new Attribute(LifeSteal, 8, 10));
AndarielsVisage.addAttr(new Attribute(Str, 25, 30));
const CrownOfAges = new Unique(Corona, "Crown of Ages", 50, 0);
CrownOfAges.addAttr(new Attribute(Def, 100, 150));
CrownOfAges.addAttr(new Attribute(DmgReducePercent, 10, 15));
CrownOfAges.addAttr(new Attribute(AllRes, 20, 30));
const GiantSkull = new Unique(BoneVisage, "Giant Skull", 0, 0);
GiantSkull.addAttr(new Attribute(Def, 250, 320));
GiantSkull.addAttr(new Attribute(Str, 25, 35));

const Targe = new Armor("Targe", "Paladin Shield", "Normal", 8, 12);
const Rondache = new Armor("Rondache", "Paladin Shield", "Normal", 10, 18);
const HeraldicShield = new Armor("Heraldic Shield", "Paladin Shield", "Normal", 16, 26);
const AerinShield = new Armor("Aerin Shield", "Paladin Shield", "Normal", 26, 36);
const CrownShield = new Armor("Crown Shield", "Paladin Shield", "Normal", 30, 40);
const AkaranTarge = new Armor("Akaran Targe", "Paladin Shield", "Exceptional", 101, 125);
const AkaranRondache = new Armor("Akaran Rondache", "Paladin Shield", "Exceptional", 113, 137);
const ProtectorShield = new Armor("Protector Shield", "Paladin Shield", "Exceptional", 129, 153);
const GildedShield = new Armor("Gilded Shield", "Paladin Shield", "Exceptional", 144, 168);
const RoyalShield = new Armor("Royal Shield", "Paladin Shield", "Exceptional", 156, 181);
const SacredTarge = new Armor("Sacred Targe", "Paladin Shield", "Elite", 126, 158);
const SacredRondache = new Armor("Sacred Rondache", "Paladin Shield", "Elite", 138, 164);
const KurastShield = new Armor("Kurast Shield", "Paladin Shield", "Elite", 154, 172);
const ZakarumShield = new Armor("Zakarum Shield", "Paladin Shield", "Elite", 169, 193);
const VortexShield = new Armor("Vortex Shield", "Paladin Shield", "Elite", 144, 168);
const HeraldOfZakarum = new Unique(GildedShield, "Herald of Zakarum", 0, 0);
HeraldOfZakarum.addAttr(new Attribute(EnhancedDef, 150, 200));
const AlmaNegra = new Unique(SacredRondache, "Alma Negra", 0, 0);
AlmaNegra.addAttr(new Attribute(EnhancedDef, 180, 210));
AlmaNegra.addAttr(new SkillAttribute(empty, "Paladin Skills", 1, 2));
AlmaNegra.addAttr(new Attribute(EnhancedDmg, 40, 75));
AlmaNegra.addAttr(new Attribute(ArPerc, 40, 75));
AlmaNegra.addAttr(new Attribute(MageDmgReduce, 5, 9));
const Dragonscale = new Unique(ZakarumShield, "Dragonscale", 0, 0);
Dragonscale.addAttr(new Attribute(EnhancedDef, 170, 200));
Dragonscale.addAttr(new Attribute(Str, 15, 25));
Dragonscale.addAttr(new Attribute(FireAbsorbPerc, 10, 20));


const Buckler = new Armor("Buckler", "Shield", "Normal", 4, 6);
const SmallShield = new Armor("Small Shield", "Shield", "Normal", 8, 10);
const LargeShield = new Armor("Large Shield", "Shield", "Normal", 12, 14);
const KiteShield = new Armor("Kite Shield", "Shield", "Normal", 16, 18);
const SpikedShield = new Armor("Spiked Shield", "Shield", "Normal", 15, 25);
const TowerShield = new Armor("Tower Shield", "Shield", "Normal", 22, 25);
const Boneshield = new Armor("Bone Shield", "Shield", "Normal", 10, 30);
const GothicShield = new Armor("Gothic Shield", "Shield", "Normal", 30, 35);
const Defender = new Armor("Defender Shield", "Shield", "Exceptional", 41, 49);
const RoundShield = new Armor("Round Shield", "Shield", "Exceptional", 47, 55);
const Scutum = new Armor("Scutum", "Shield", "Exceptional", 53, 61);
const BarbedShield = new Armor("Barbed Shield", "Shield", "Exceptional", 58, 78);
const DragonShield = new Armor("Dragon Shield", "Shield", "Exceptional", 59, 67);
const GrimShield = new Armor("Grim Shield", "Shield", "Exceptional", 50, 150);
const Pavise = new Armor("Pavise", "Shield", "Exceptional", 68, 78);
const AncientShield = new Armor("Ancient Shield", "Shield", "Exceptional", 80, 93);
const Heater = new Armor("Heater", "Shield", "Elite", 95, 110);
const Luna = new Armor("Luna", "Shield", "Elite", 108, 123);
const Hyperion = new Armor("Hyperion", "Shield", "Elite", 119, 135);
const Monarch = new Armor("Monarch", "Shield", "Elite", 133, 148);
const BladeBarrier = new Armor("BladeBarrier", "Shield", "Elite", 147, 163);
const Aegis = new Armor("Aegis", "Shield", "Elite", 145, 161);
const TrollNest = new Armor("Troll Nest", "Shield", "Elite", 158, 173);
const Ward = new Armor("Ward", "Shield", "Elite", 153, 170);
const PeltaLunata = new Unique(Buckler, "Pelta Lunata", 0, 30);
PeltaLunata.addAttr(new Attribute(EnhancedDef, 30, 40));
const UmbralDisk = new Unique(SmallShield, "Umbral Disk", 0, 30);
UmbralDisk.addAttr(new Attribute(EnhancedDef, 40, 50));
UmbralDisk.addAttr(new Attribute(Durability, 10, 15));
const Stormguild = new Unique(LargeShield, "Stormguild", 0, 30);
Stormguild.addAttr(new Attribute(EnhancedDef, 50, 60));
const Steelclash = new Unique(KiteShield, "Steelclash", 0, 20);
Steelclash.addAttr(new Attribute(EnhancedDef, 60, 100));
const SwordbackHold = new Unique(SpikedShield, "Swordback Hold", 0, 10);
SwordbackHold.addAttr(new Attribute(EnhancedDef, 30, 60));
const BverritKeep = new Unique(TowerShield, "Bverrit Keep", 0, 30);
BverritKeep.addAttr(new Attribute(EnhancedDef, 80, 120));
const WallOfTheEyeless = new Unique(Boneshield, "Wall of the Eyeless", 0, 10);
WallOfTheEyeless.addAttr(new Attribute(EnhancedDef, 30, 40));
const TheWard = new Unique(GothicShield, "Ward", 100, 40);
TheWard.addAttr(new Attribute(AllRes, 30, 50));
const Visceratuant = new Unique(Defender, "Visceratuant", 0, 0);
Visceratuant.addAttr(new Attribute(EnhancedDef, 100, 150));
const MosersBlessed = new Unique(RoundShield, "Moser's Blessed", 0, 0);
MosersBlessed.addAttr(new Attribute(EnhancedDef, 180, 220));
const Stormchaser = new Unique(Scutum, "Stormchaser", 0, 0);
Stormchaser.addAttr(new Attribute(EnhancedDef, 160, 220));
const TiamatsRebuke = new Unique(DragonShield, "Tiamats Rebuke", 0, 0);
TiamatsRebuke.addAttr(new Attribute(EnhancedDef, 140, 200));
TiamatsRebuke.addAttr(new Attribute(AllRes, 25, 35));
const LanceGuard = new Unique(BarbedShield, "Lance Guard", 0, 0);
LanceGuard.addAttr(new Attribute(EnhancedDef, 70, 120));
const Gerkes = new Unique(Pavise, "Gerke's", 0, 0);
Gerkes.addAttr(new Attribute(EnhancedDef, 180, 240));
Gerkes.addAttr(new Attribute(AllRes, 20, 30));
Gerkes.addAttr(new Attribute(DmgReduce, 11, 16));
Gerkes.addAttr(new Attribute(MageDmgReduce, 14, 18));
const LidlessWall = new Unique(GrimHelm, "Lidless Wall", 0, 0);
LidlessWall.addAttr(new Attribute(EnhancedDef, 80, 130));
LidlessWall.addAttr(new Attribute(ManaOnKill, 3, 5));
const RadamentsSphere = new Unique(AncientShield, "Radament's Sphere", 0, 0);
RadamentsSphere.addAttr(new Attribute(EnhancedDef, 160, 200));
const BlackoakShield = new Unique(Luna, "Blackoak Shield", 0, 0);
BlackoakShield.addAttr(new Attribute(EnhancedDef, 160, 200));
const Stormshield = new Unique(Monarch, "Stormshield", 0, 0);
const SpikeThorn = new Unique(BladeBarrier, "Spike Thorn", 0, 0);
SpikeThorn.addAttr(new Attribute(EnhancedDef, 120, 150));
const MedusasGaze = new Unique(Aegis, "Medusa's Gaze", 0, 0);
MedusasGaze.addAttr(new Attribute(EnhancedDef, 150, 180));
MedusasGaze.addAttr(new Attribute(LifeSteal, 5, 9));
MedusasGaze.addAttr(new Attribute(ColdRes, 40, 80));
const HeadHuntersGlory = new Unique(TrollNest, "Head Hunter's Glory", 0, 0);
HeadHuntersGlory.addAttr(new Attribute(Def, 320, 420));
HeadHuntersGlory.addAttr(new Attribute(DefVsMisl, 300, 350));
HeadHuntersGlory.addAttr(new Attribute(FireRes, 20, 30));
HeadHuntersGlory.addAttr(new Attribute(PsnRes, 30, 40));
HeadHuntersGlory.addAttr(new Attribute(LifeOnKill, 5, 7));
const SpiritWard = new Unique(Ward, "Spirit Ward", 0, 0);
SpiritWard.addAttr(new Attribute(EnhancedDef, 130, 180));
SpiritWard.addAttr(new Attribute(IncrChanceBlockPerc, 20, 30));
SpiritWard.addAttr(new Attribute(ColdAsbInt, 6, 11));

const PreservedHead = new Armor("Preserved Head", "Shrunken Head", "Normal", 2, 5);
const ZombieHead = new Armor("Zombie Head", "Shrunken Head", "Normal", 4, 8);
const UnravellerHead = new Armor("Unraveller Head", "Shrunken Head", "Normal", 6, 10);
const GargoyleHead = new Armor("Gargoyle Head", "Shrunken Head", "Normal", 10, 16);
const DemonHead = new Armor("Demon Head", "Shrunken Head", "Normal", 15, 20);
const MummifiedTrophy = new Armor("Mummified Trophy", "Shrunken Head", "Exceptional", 38, 48);
const FetishTrophy = new Armor("Fetish Trophy", "Shrunken Head", "Exceptional", 41, 52);
const SextonTrophy = new Armor("Sexton Trophy", "Shrunken Head", "Exceptional", 44, 55);
const CantorTrophy = new Armor("Cantor Trophy", "Shrunken Head", "Exceptional", 50, 64);
const HierophantTrophy = new Armor("Hierophant Trophy", "Shrunken Head", "Exceptional", 58, 70);
const MinionSkull = new Armor("Minion Skull", "Shrunken Head", "Elite", 95, 139);
const HellspawnSkull = new Armor("Hellspawn Skull", "Shrunken Head", "Elite", 96, 141);
const OverseerSkull = new Armor("Overseer Skull", "Shrunken Head", "Elite", 98, 142);
const SuccubusSkull = new Armor("Succubus Skull", "Shrunken Head", "Elite", 100, 146);
const BloodlordSkull = new Armor("Bloodlord Skull", "Shrunken Head", "Elite", 103, 148);
const Homunculus = new Unique(HierophantTrophy, "Homunculus", 0, 0);
Homunculus.addAttr(new Attribute(EnhancedDef, 150, 200));
const DarkforceSpawn = new Unique(BloodlordSkull, "Darkforce Spawn", 0, 0);
DarkforceSpawn.addAttr(new Attribute(EnhancedDef, 140, 180));
DarkforceSpawn.addAttr(new SkillAttribute(empty, "Summoning Skills", 1, 3));
DarkforceSpawn.addAttr(new SkillAttribute(empty, "Poison and Bone Spells", 1, 3));
DarkforceSpawn.addAttr(new SkillAttribute(empty, "Cursses", 1, 3));
const Boneflame = new Unique(SuccubusSkull, "Boneflame", 0, 0);
Boneflame.addAttr(new Attribute(EnhancedDef, 120, 150));
Boneflame.addAttr(new SkillAttribute(empty, "Necromancer Skill Levels", 2, 3));
Boneflame.addAttr(new Attribute(AllRes, 20, 30));

const StagBow = new Weapon("Stag Bow", "Amazon", "Normal", 7, 12);
const ReflexBow = new Weapon("Reflex Bow", "Amazon", "Normal", 9, 19);
const MaidenSpear = new Weapon("Maiden Spear", "Amazon", "Normal", 18, 24);
const MaidenPike = new Weapon("Maiden Pike", "Amazon", "Normal", 23, 55);
const MaidenJavelin = new Weapon("Maiden Javelin", "Amazon", "Normal", 6, 22);
const AshwoodBow = new Weapon("Ashwood Bow", "Amazon", "Exceptional", 16, 29);
const CeremonialBow = new Weapon("Ceremonial Bow", "Amazon", "Exceptional", 19, 41);
const CeremonialSpear = new Weapon("Ceremonial Spear", "Amazon", "Normal", 34, 51);
const CeremonialPike = new Weapon("Ceremonial Pike", "Amazon", "Exceptional", 42, 101);
const CeremonialJavelin = new Weapon("Ceremonial Javelin", "Amazon", "Exceptional", 18, 54);
const MatriarchalBow = new Weapon("Matriarchal Bow", "Amazon", "Elite", 20, 47);
const GrandMatronBow = new Weapon("Grand Matron Bow", "Amazon", "Elite", 14, 72);
const MatriarchalSpear = new Weapon("Matriarchal Spear", "Amazon", "Elite", 65, 95);
const MatriarchalPike = new Weapon("Matriarchal Pike", "Amazon", "Elite", 37, 153);
const MatriarchalJavelin = new Weapon("Matriarchal Javelin", "Amazon", "Elite", 30, 54);
const LycandersAim = new Unique(CeremonialBow, "Lycander's Aim", 0, 0);
LycandersAim.addAttr(new Attribute(EnhancedDmg, 150, 200));
LycandersAim.addAttr(new Attribute(ManaSteal, 5, 8));
const LycandersFlank = new Unique(CeremonialPike, "Lycander's Flank", 0, 0);
LycandersFlank.addAttr(new Attribute(EnhancedDmg, 150, 200));
LycandersFlank.addAttr(new Attribute(LifeSteal, 5, 9));
const TitansRevenge = new Unique(CeremonialJavelin, "Titan's Revenge", 0, 0);
TitansRevenge.addAttr(new Attribute(EnhancedDmg, 150, 200));
TitansRevenge.addAttr(new Attribute(LifeSteal, 5, 9));
const BloodRavensCharge = new Unique(MatriarchalBow, "Blood Ravens Charge", 0, 0);
BloodRavensCharge.addAttr(new Attribute(EnhancedDmg, 180, 230));
BloodRavensCharge.addAttr(new Attribute(ArPerc, 200, 300));
BloodRavensCharge.addAttr(new SkillAttribute(empty, "Bow and Crossbow Skills", 2, 4));
const Stoneraven = new Unique(MatriarchalSpear, "Stoneraven", 0, 0);
Stoneraven.addAttr(new Attribute(EnhancedDmg, 230, 280));
Stoneraven.addAttr(new Attribute(Def, 400, 600));
Stoneraven.addAttr(new Attribute(AllRes, 30, 50));
Stoneraven.addAttr(new SkillAttribute(empty, "Javelin and Spear Skills", 1, 3));
const Thunderstroke = new Unique(MatriarchalJavelin, "Thunderstroke", 0, 0);
Thunderstroke.addAttr(new Attribute(EnhancedDmg, 150, 200));
Thunderstroke.addAttr(new SkillAttribute(empty, "Javelin and Spear Skills", 2, 3));

const HandAxe = new Weapon("Hand Axe", "Axe", "Normal", 3, 6);
const Axe = new Weapon("Axe", "Axe", "Normal", 4, 11);
const DoubleAxe = new Weapon("Double Axe", "Axe", "Normal", 5, 13);
const MiliatryPick = new Weapon("Military Pick", "Axe", "Normal", 7, 11);
const WarAxe = new Weapon("War Axe", "Axe", "Normal", 10, 18);
const LargeAxe = new Weapon("Large Axe", "Axe", "Normal", 6, 13);
const BroadAxe = new Weapon("Broad Axe", "Axe", "Normal", 10, 18);
const BattleAxe = new Weapon("Battle Axe", "Axe", "Normal", 12, 32);
const GreatAxe = new Weapon("Great Axe", "Axe", "Normal", 9, 30);
const GiantAxe = new Weapon("Giant Axe", "Axe", "Normal", 22, 45);
const Hatchet = new Weapon("Hatchet", "Axe", "Exceptional", 10, 21);
const Cleaver = new Weapon("Cleaver", "Axe", "Exceptional", 10, 33);
const TwinAxe = new Weapon("Twin Axe", "Axe", "Exceptional", 13, 38);
const Crowbill = new Weapon("Crowbill", "Axe", "Exceptional", 14, 34);
const Naga = new Weapon("Naga", "Axe", "Exceptional", 16, 45);
const MilitaryAxe = new Weapon("Military Axe", "Axe", "Exceptional", 14, 34);
const BeardedAxe = new Weapon("Bearded Axe", "Axe", "Exceptional", 21, 49);
const Tabar = new Weapon("Tabar", "Axe", "Exceptional", 24, 77);
const GothicAxe = new Weapon("Gothic Axe", "Axe", "Exceptional", 18, 70);
const AncientAxe = new Weapon("Ancient Axe", "Axe", "Exceptional", 43, 85);
const Tomahawk = new Weapon("Tomahawk", "Axe", "Elite", 33, 58);
const SmallCrescent = new Weapon("Small Crescent", "Axe", "Elite", 38, 60);
const EttinAxe = new Weapon("Ettin Axe", "Axe", "Elite", 33, 66);
const WarSpike = new Weapon("War Spike", "Axe", "Elite", 30, 48);
const BerserkerAxe = new Weapon("Berserker Axe", "Axe", "Elite", 24, 71);
const FeralAxe = new Weapon("Feral Axe", "Axe", "Elite", 25, 123);
const SilverEdgedAxe = new Weapon("Silver-Edged Axe", "Axe", "Elite", 62, 110);
const Decapitator = new Weapon("Decapitator", "Axe", "Elite", 49, 137);
const ChampionAxe = new Weapon("Champion Axe", "Axe", "Elite", 59, 94);
const GloriousAxe = new Weapon("Glorious Axe", "Axe", "Elite", 60, 124);
const Gnasher = new Unique(HandAxe, "The Gnasher", 0, 0);
Gnasher.addAttr(new Attribute(EnhancedDmg, 60, 70));
const Deathspade = new Unique(Axe, "Deathspade", 0, 0);
Deathspade.addAttr(new Attribute(EnhancedDmg, 60, 70));
const Bladebone = new Unique(DoubleAxe, "Bladebone", 0, 0);
Bladebone.addAttr(new Attribute(EnhancedDmg, 30, 50));
const SkullSplitter = new Unique(MiliatryPick, "Skull Splitter", 0, 0);
SkullSplitter.addAttr(new Attribute(EnhancedDmg, 60, 100));
const Rakescar = new Unique(WarAxe, "Rakescar", 0, 0);
Rakescar.addAttr(new Attribute(EnhancedDmg, 75, 150));
const AxeOfFechmar = new Unique(LargeAxe, "Axe of Fechmar", 0, 0);
AxeOfFechmar.addAttr(new Attribute(EnhancedDmg, 70, 90));
const Goreshovel = new Unique(BroadAxe, "Goreshovel", 0, 0);
Goreshovel.addAttr(new Attribute(EnhancedDmg, 40, 50));
const Chieftain = new Unique(BattleAxe, "The Chieftain", 0, 0);
Chieftain.addAttr(new Attribute(AllRes, 10, 20));
const Brainhew = new Unique(GreatAxe, "Brainhew", 0, 0);
Brainhew.addAttr(new Attribute(EnhancedDmg, 50, 80));
Brainhew.addAttr(new Attribute(ManaSteal, 10, 13));
const Humongous = new Unique(GiantAxe, "Humongous", 0, 0);
Humongous.addAttr(new Attribute(EnhancedDmg, 80, 120));
Humongous.addAttr(new Attribute(Str, 20, 30));
const RazorsEdge = new Unique(Tomahawk, "Razor's Edge", 0, 0);
RazorsEdge.addAttr(new Attribute(EnhancedDmg, 175, 225));
const RuneMaster = new Unique(EttinAxe, "Rune Master", 220, 270);
RuneMaster.addAttr(new Attribute(EnhancedDmg, 220, 270));
const Cranebeak = new Unique(WarSpike, "Cranebeak", 0, 0);
Cranebeak.addAttr(new Attribute(EnhancedDmg, 240, 300));
Cranebeak.addAttr(new Attribute(MagicFind, 20, 50));
const DeathCleaver = new Unique(BerserkerAxe, "Death Cleaver", 0, 0);
DeathCleaver.addAttr(new Attribute(EnhancedDmg, 230, 280));
DeathCleaver.addAttr(new Attribute(LifeOnKill, 6, 9));
const EtherealEdge = new Unique(SilverEdgedAxe, "Ethereal Edge", 0, 0);
EtherealEdge.addAttr(new Attribute(EnhancedDmg, 150, 180));
EtherealEdge.addAttr(new Attribute(DmgDemon, 150, 200));
EtherealEdge.addAttr(new Attribute(Ar, 270, 350));
EtherealEdge.addAttr(new Attribute(FireAsbInt, 10, 12));
EtherealEdge.addAttr(new Attribute(LifeOnDemonKill, 5, 10));
const Hellslayer = new Unique(Decapitator, "Hellslayer", 100, 0);
Hellslayer.addAttr(new SkillAttribute(empty, "On attack fire ball level", 16, 20));
const MessersschmidtsReaver = new Unique(ChampionAxe, "Messerschmidt's Reaver", 200, 0);
const ExecutionersJustice = new Unique(GloriousAxe, "Exectuioner's Justice", 0, 0);
ExecutionersJustice.addAttr(new Attribute(EnhancedDmg, 240, 290));

const ShortBow = new Weapon("Short Bow", "Bow", "Normal", 1, 4);
const HuntersBow = new Weapon("Hunter's Bow", "Bow", "Normal", 2, 6);
const LongBow = new Weapon("Long Bow", "Bow", "Normal", 3, 10);
const CompositeBow = new Weapon("Composite Bow", "Bow", "Normal", 4, 8);
const ShortBattleBow = new Weapon("Short Battle Bow", "Bow", "Normal", 5, 11);
const LongBattleBow = new Weapon("Long Battle Bow", "Bow", "Normal", 3, 18);
const ShortWarBow = new Weapon("Short War Bow", "Bow", "Normal", 6, 14);
const LongWarBow = new Weapon("Long War Bow", "Bow", "Normal", 3, 23);
const EdgeBow = new Weapon("Edge Bow", "Bow", "Exceptional", 6, 19);
const RazorBow = new Weapon("Razor Bow", "Bow", "Exceptional", 8, 22);
const CedarBow = new Weapon("Cedar Bow", "Bow", "Exceptional", 10, 29);
const DoubleBow = new Weapon("Double Bow", "Bow", "Exceptional", 11, 26);
const ShortSiegeBow = new Weapon("Short Siege Bow", "Bow", "Exceptional", 13, 30);
const LargeSiegeBow = new Weapon("Large Siege Bow", "Bow", "Exceptional", 10, 42);
const RuneBow = new Weapon("Rune Bow", "Bow", "Exceptional", 14, 35);
const GothicBow = new Weapon("Gothic Bow", "Bow", "Exceptional", 10, 50);
const SpiderBow = new Weapon("Spider Bow", "Bow", "Elite", 23, 50);
const BladeBow = new Weapon("Blade Bow", "Bow", "Elite", 21, 41);
const ShadowBow = new Weapon("Shadow Bow", "Bow", "Elite", 15, 59);
const GreatBow = new Weapon("Great Bow", "Bow", "Elite", 12, 52);
const DiamondBow = new Weapon("Diamond Bow", "Bow", "Elite", 33, 40);
const CrusaderBow = new Weapon("Crusader Bow", "Bow", "Elite", 15, 63);
const WardBow = new Weapon("Ward Bow", "Bow", "Elite", 20, 53);
const HydraBow = new Weapon("Hydra Bow", "Bow", "Elite", 10, 68);
const RavenClaw = new Unique(LongBow, "Raven Claw", 65, 0);
const KukoShakaku = new Unique(CedarBow, "Kuko Shakaku", 0, 0);
KukoShakaku.addAttr(new Attribute(EnhancedDmg, 150, 180));
const Eaglehorn = new Unique(CrusaderBow, "Eaglehorn", 200, 0);
const Widowmaker = new Unique(WardBow, "Widowmaker", 0, 0);
Widowmaker.addAttr(new Attribute(EnhancedDmg, 150, 200));
Widowmaker.addAttr(new SkillAttribute(empty, "Guided Arrow", 3, 5));
const Windoforce = new Unique(HydraBow, "Windforce", 250, 0);
Windoforce.addAttr(new Attribute(ManaSteal, 6, 8));

const LightCrossbow = new Weapon("Light Crossbow", "Crossbow", "Normal", 6, 9);
const Crossbow = new Weapon("Crossbow", "Crossbow", "Normal", 9, 16);
const HeavyCrossbow = new Weapon("Heavy Crossbow", "Crossbow", "Normal", 14, 26);
const RepeatingCrossbow = new Weapon("Repeating Crossbow", "Crossbow", "Normal", 6, 12);
const Arbalest = new Weapon("Arbalest", "Crossbow", "Exceptional", 14, 27);
const SiegeCrossbow = new Weapon("Siege Crossbow", "Crossbow", "Exceptional", 20, 42);
const Ballista = new Weapon("Ballista", "Crossbow", "Exceptional", 33, 55);
const ChuKoNu = new Weapon("Chu-Ko-Nu", "Crossbow", "Exceptional", 14, 32);
const PelletBow = new Weapon("Pellet Bow", "Crossbow", "Elite", 28, 73);
const GorgonCrossbow = new Weapon("Gorgon Crossbow", "Crossbow", "Elite", 25, 87);
const CollossusCrossbow = new Weapon("Colossus Crossbow", "Crossbow", "Elite", 32, 91);
const DemonCrossbow = new Weapon("Demon Crossbow", "Crossbow", "Elite", 26, 40);
const Hellrack = new Unique(CollossusCrossbow, "Hellrack", 0, 0);
Hellrack.addAttr(new Attribute(EnhancedDmg, 180, 230));
Hellrack.addAttr(new Attribute(ArPerc, 100, 150));
const GutSiphon = new Unique(DemonCrossbow, "Gut Siphon", 0, 0);
GutSiphon.addAttr(new Attribute(EnhancedDmg, 160, 220));
GutSiphon.addAttr(new Attribute(LifeSteal, 12, 18));

const Dagger = new Weapon("Dagger", "Dagger", "Normal", 1, 4);
const Dirk = new Weapon("Dirk", "Dagger", "Normal", 3, 9);
const Kris = new Weapon("Kris", "Dagger", "Normal", 2, 11);
const Blade = new Weapon("Blade", "Dagger", "Normal", 4, 15);
const Poignard = new Weapon("Poignard", "Dagger", "Exceptional", 6, 18);
const Rondel = new Weapon("Rondel", "Dagger", "Exceptional", 10, 26);
const Cinquedeas = new Weapon("Cinquedeas", "Dagger", "Exceptional", 15, 31);
const Stiletto = new Weapon("Stiletto", "Dagger", "Exceptional", 19, 36);
const BoneKnife = new Weapon("Bone Knife", "Dagger", "Elite", 23, 49);
const MithrilPoint = new Weapon("Bone Knife", "Dagger", "Elite", 37, 53);
const FangedKnife = new Weapon("Fanged Kinfe", "Dagger", "Elite", 15, 57);
const LegendSpike = new Weapon("Legend Spike", "Dagger", "Elite", 31, 47);
const Gull = new Unique(Dagger, "Gull", 0, 0);
const Wizardspike = new Unique(BoneKnife, "Bone Knife", 0, 0);
const Fleshripper = new Unique(FangedKnife, "Fleshripper", 0, 0);
Fleshripper.addAttr(new Attribute(EnhancedDmg, 200, 300));
const GhostFlame = new Unique(LegendSpike, "Dagger", "Elite", 0);
GhostFlame.addAttr(new Attribute(EnhancedDmg, 190, 240));
GhostFlame.addAttr(new Attribute(ManaSteal, 10, 15));


const Katar = new Weapon("Katar", "Katar", "Normal", 4, 7);
const WristBlade = new Weapon("Wrist Blade", "Katar", "Normal", 5, 9);
const HatchetHands = new Weapon("Hatchet Hands", "Katar", "Normal", 2, 15);
const Cestus = new Weapon("Cestus", "Katar", "Normal", 7, 15);
const Claws = new Weapon("Claws", "Katar", "Normal", 8, 15);
const BladeTalons = new Weapon("Blade Talons", "Katar", "Normal", 10, 14);
const ScissorsKatar = new Weapon("ScissorsKatar", "Katar", "Normal", 9, 17);
const Quhab = new Weapon("Quhab", "Katar", "Exceptional", 11, 24);
const WristSpike = new Weapon("Wrist Spike", "Katar", "Exceptional", 13, 27);
const Fascia = new Weapon("Fascia", "Katar", "Exceptional", 8, 37);
const HandScythe = new Weapon("Hand Scythe", "Katar", "Exceptional", 21, 35);
const GreaterClaws= new Weapon("Greater Claws", "Katar", "Exceptional", 18, 37);
const GreaterTalons = new Weapon("Greater Talons", "Katar", "Exceptional", 21, 35);
const ScissorsQuhab = new Weapon("ScissorsQuhab", "Katar", "Exceptional", 19, 40);
const Suwayyah = new Weapon("Suwayyah", "Katar", "Elite", 39, 52);
const WristSword = new Weapon("Wrist Sword", "Katar", "Elite", 34, 45);
const WarFist = new Weapon("War Fist", "Katar", "Elite", 44, 53);
const BattleCestus = new Weapon("Battle Cestus", "Katar", "Elite", 36, 42);
const FeralClaws = new Weapon("Feral Claws", "Katar", "Elite", 22, 53);
const RunicTalons = new Weapon("Runic Talons", "Katar", "Elite", 24, 44);
const ScissorsSuwayyah = new Weapon("Scissors Suwayyah", "Katar", "Elite", 40, 51);
const BartucsCutThrout = new Unique(GreaterTalons, "Bartuc's Cut-Throat", 0, 0);
BartucsCutThrout.addAttr(new Attribute(EnhancedDmg, 150, 200));
BartucsCutThrout.addAttr(new Attribute(LifeSteal, 5, 9));
const JadeTalon = new Unique(WristSword, "Jade Talon", 0, 0);
JadeTalon.addAttr(new Attribute(EnhancedDmg, 190, 240));
JadeTalon.addAttr(new SkillAttribute(empty, "Martial Arts", 1, 2));
JadeTalon.addAttr(new SkillAttribute(empty, "Shadow Disciplines", 1, 2));
JadeTalon.addAttr(new Attribute(ManaSteal, 10, 15));
JadeTalon.addAttr(new Attribute(AllRes, 40, 50));
const ShadowKiller = new Unique(BattleCestus, "Shadow Killer", 0, 0);
ShadowKiller.addAttr(new Attribute(EnhancedDef, 170, 220));
ShadowDancer.addAttr(new Attribute(ManaOnKill, 10, 15));
const FirelizardsTalons = new Unique(FeralClaws, "Firelizard's Talons", 0, 0);
FirelizardsTalons.addAttr(new Attribute(EnhancedDmg, 200, 270));
FirelizardsTalons.addAttr(new SkillAttribute(empty, "Martial Arts", 1, 3));
FirelizardsTalons.addAttr(new SkillAttribute(empty, "Wake of Inferno", 1, 2));
FirelizardsTalons.addAttr(new SkillAttribute(empty, "Wake of Fire", 1, 2));
FirelizardsTalons.addAttr(new Attribute(FireRes, 40, 70));

const EagleOrb = new Weapon("Eagle Orb", "Sorceress Orb", "Normal", 2, 5);
const SacredGlobe = new Weapon("Sacred Globe", "Sorceress Orb", "Normal", 3, 8);
const SmokedSphere = new Weapon("Smoked Sphere", "Sorceress Orb", "Normal", 4, 10);
const ClaspedOrb = new Weapon("Clasped Orb", "Sorceress Orb", "Normal", 5, 12);
const JaredsStone = new Weapon("Jared's Stone ", "Sorceress Orb", "Normal", 8, 18);
const GlowingOrb = new Weapon("Glowing Orb", "Sorceress Orb", "Exceptional", 8, 21);
const CrystallineGlobe = new Weapon("Crystalline Globe", "Sorceress Orb", "Exceptional", 10, 26);
const CloudySphere = new Weapon("Cloudy Sphere", "Sorceress Orb", "Exceptional", 11, 29);
const SparklingBall = new Weapon("Sparkling Ball", "Sorceress Orb", "Exceptional", 13, 32);
const SwirlingCrystal = new Weapon("Swirling Crystal", "Sorceress Orb", "Exceptional", 18, 42);
const HeavenlyStone = new Weapon("Heavenly Stone", "Sorceress Orb", "Elite", 21, 46);
const EldritchOrb = new Weapon("Eldritch Orb", "Sorceress Orb", "Elite", 18, 50);
const DemonHeart = new Weapon("Demon Heart", "Sorceress Orb", "Elite", 23, 55);
const VortexOrb = new Weapon("Vortex Orb", "Sorceress Orb", "Elite", 12, 66);
const DimensionalShard = new Weapon("Dimensional Shard", "Sorceress Orb", "Elite", 30, 53);
const Oculus = new Unique(SwirlingCrystal, "Oculus", 0, 0);
const EschutasTemper = new Unique(EldritchOrb, "Eschuta's Temper", 0, 0);
EschutasTemper.addAttr(new SkillAttribute(empty, "Sorceress Skills", 1, 3));
EschutasTemper.addAttr(new Attribute(FireDmgPerc, 10, 20));
EschutasTemper.addAttr(new Attribute(LightDmgPerc, 10, 20));
EschutasTemper.addAttr(new Attribute(Energy, 20, 30));
const DeathsFathom = new Unique(DimensionalShard, "Death's Fathom", 0, 0);
DeathsFathom.addAttr(new Attribute(ColdDmgPerc, 15, 30));
DeathsFathom.addAttr(new Attribute(LightRes, 25, 40));
DeathsFathom.addAttr(new Attribute(FireRes, 25, 40));

const Bardiche = new Weapon("Bardiche", "Polearms", "Normal", 1, 27);
const Voulge = new Weapon("Voulge", "Polearms", "Normal", 6, 21);
const Scythe = new Weapon("Scythe", "Polearms", "Normal", 8, 20);
const Poleaxe = new Weapon("Poleaxe", "Polearms", "Normal", 18, 39);
const Halberd = new Weapon("Halberd", "Polearms", "Normal", 12, 45);
const WarScythe = new Weapon("War Scythe", "Polearms", "Normal", 15, 36);
const LochaberAxe = new Weapon("LochaberAxe", "Polearms", "Exceptional", 6, 58);
const Bill = new Weapon("Bill", "Polearms", "Exceptional", 14, 53);
const BattleScythe = new Weapon("Battle Scythe", "Polearms", "Exceptional", 18, 45);
const Partizan = new Weapon("Partizan", "Polearms", "Exceptional", 34, 75);
const BedDeCorbin = new Weapon("Bec-De-Corbin", "Polearms", "Exceptional", 13, 85);
const GrimScythe = new Weapon("Grim Scythe", "Polearms", "Exceptional", 30, 70);
const OgreAxe = new Weapon("Ogre Axe", "Polearms", "Elite", 28, 145);
const ColossusVoulge = new Weapon("Colossus Voulge", "Polearm", "Elite", 17, 165);
const Thresher = new Weapon("Thresher", "Polearm", "Elite", 12, 141);
const CrypticAxe = new Weapon("Cryptic Axe", "Polearm", "Elite", 33, 150);
const GreatPoleaxe = new Weapon("Great Poleaxe", "Polearm", "Elite", 46, 127);
const GiantThresher = new Weapon("Giant Thresher", "Polearm", "Elite", 40, 114);
const Bonehew = new Unique(OgreAxe, "Bonehew", 0, 0);
Bonehew.addAttr(new Attribute(EnhancedDmg, 270, 320));
const ReapersToll = new Unique(Thresher, "Reapers Toll", 0, 0);
ReapersToll.addAttr(new Attribute(EnhancedDmg, 190, 240));
ReapersToll.addAttr(new Attribute(LifeSteal, 11, 15));
const TombReaver = new Unique(CrypticAxe, "Tomb Reaver", 0, 0);
TombReaver.addAttr(new Attribute(EnhancedDmg, 200, 280));
TombReaver.addAttr(new Attribute(DmgUndead, 150, 230));
TombReaver.addAttr(new Attribute(ArUndead, 250, 350));
TombReaver.addAttr(new Attribute(AllRes, 30, 50));
TombReaver.addAttr(new Attribute(LifeOnKill, 10, 14));
TombReaver.addAttr(new Attribute(MagicFind, 50, 80));
const Stormspire = new Unique(GiantThresher, "Stormspire", 0, 0);
Stormspire.addAttr(new Attribute(EnhancedDmg, 150, 250));

const Wand = new Weapon("Wand", "Wand", "Normal", 2, 4);
const YewWand = new Weapon("Yew Wand", "Wand", "Normal", 2, 8);
const BoneWand = new Weapon("Bone Wand", "Wand", "Normal", 3, 7);
const GrimWand = new Weapon("GrimWand", "Wand", "Normal", 5, 11);
const BurntWand = new Weapon("Burnt Wand", "Wand", "Exceptional", 8, 18);
const PetrifiedWand = new Weapon("Petrified Wand", "Wand", "Exceptional", 8, 24);
const TombWand = new Weapon("Tomb Wand", "Wand", "Exceptional", 10, 22);
const GraveWand = new Weapon("Grave Wand", "Wand", "Exceptional", 13, 29);
const PolishedWand = new Weapon("Polished Wand", "Wand", "Elite", 18, 33);
const GhostWand = new Weapon("Ghost Wand", "Wand", "Elite", 20, 40);
const LichWand = new Weapon("Lich Wand", "Wand", "Elite", 10, 31);
const UnearthedWand = new Weapon("Unearthed Wand", "Wand", "Elite", 22, 28);
const TorchOfIro = new Unique(Wand, "Torch of Iro", 0, 0);
const Maelstrom = new Unique(YewWand, "Maelstrom", 0, 0);
Maelstrom.addAttr(new SkillAttribute(empty, "Iron Maiden", 1, 3));
Maelstrom.addAttr(new SkillAttribute(empty, "Amplify Damage", 1, 3));
Maelstrom.addAttr(new SkillAttribute(empty, "Terror", 1, 3));
Maelstrom.addAttr(new SkillAttribute(empty, "Corpse Explosion", 1, 3));
const Gravespine = new Unique(BoneWand, "Gravespine", 0, 0);
Gravespine.addAttr(new Attribute(Mana, 25, 50));
const UmesLament = new Unique(GrimWand, "Ume's Lament", "Wand", 5, 11);
const SuicideBranch = new Unique(BurntWand, "Suicide Branch", 0, 0);
const CarinShard = new Unique(PetrifiedWand, "Carin Shard", 0, 0);
const ArmOfKingLeoric = new Unique(TombWand, "Arm of King Leoric", 0, 0);
const BlackhandKey = new Unique(GraveWand, "Blackhand Key", 0, 0);
const Boneshade = new Unique(LichWand, "Boneshade", 0, 0);
Boneshade.addAttr(new SkillAttribute(empty, "Bone Spirit", 1, 2));
Boneshade.addAttr(new SkillAttribute(empty, "Bone Spear", 2, 3));
Boneshade.addAttr(new SkillAttribute(empty, "Bone Wall", 2, 3));
Boneshade.addAttr(new SkillAttribute(empty, "Bone Armor", 4, 5));
Boneshade.addAttr(new SkillAttribute(empty, "Teeth", 4, 5));
const DeathsWeb = new Unique(UnearthedWand, "Death's Web", 0, 0);
DeathsWeb.addAttr(new SkillAttribute(empty, "Poison and Bone Spells", 1, 2));
DeathsWeb.addAttr(new Attribute(EnemyPsnResist, 40, 50));
DeathsWeb.addAttr(new Attribute(ManaOnKill, 7, 12));
DeathsWeb.addAttr(new Attribute(LifeOnKill, 7, 12));

const Javelin = new Weapon("Javelin", "Javelin", "Normal", 6, 14);
const Pilum = new Weapon("Pilum", "Javelin", "Normal", 7, 20);
const ShortSpear = new Weapon("Short Spear", "Javelin", "Normal", 10, 22);
const Glaive = new Weapon("Glaive", "Javelin", "Normal", 16, 22);
const ThrowingSpear = new Weapon("Throwing Spear", "Javelin", "Normal", 12, 30);
const WarJavelin = new Weapon("War Javelin", "Javelin", "Exceptional", 14, 32);
const GreatPilum = new Weapon("Great Pilum", "Javelin", "Exceptional", 16, 42);
const Simbilan = new Weapon("Simbilan", "Javelin", "Exceptional", 27, 50);
const Spiculum = new Weapon("Spiculum", "Javelin", "Exceptional", 32, 60);
const Harpoon = new Weapon("Harpoon", "Javelin", "Exceptional", 18, 54);
const HyperionJavelin = new Weapon("Hyperion Javelin", "Javelin", "Elite", 28, 55);
const StygianPilum = new Weapon("Stygian Pilum", "Javelin", "Elite", 21, 75);
const BalrogSpear = new Weapon("Balrog Spear", "Javelin", "Elite", 40, 62);
const GhostGlaive = new Weapon("Ghost Glaive", "Javelin", "Elite", 30, 85);
const WingedHarpoon = new Weapon("Winged Harpoon", "Javelin", "Elite", 11, 77);

const Club = new Weapon("Club", "Mace", "Normal", 1, 6);
const SpikedClub = new Weapon("Spiked Club", "Mace", "Normal", 5, 8);
const Mace = new Weapon("Mace", "Mace", "Normal", 3, 10);
const MorningStar = new Weapon("Morning Star", "Mace", "Normal", 7, 16);
const Flail = new Weapon("Flail", "Mace", "Normal", 1, 24);
const WarHammer = new Weapon("War Hammer", "Mace", "Normal", 19, 29);
const Maul = new Weapon("Maul", "Mace", "Normal", 30, 43);
const GreatMaul = new Weapon("Great Maul", "Mace", "Normal", 38, 58);
const Cudgel = new Weapon("Cudgel", "Mace", "Exceptional", 6, 21);
const BarbedClub = new Weapon("Barbed Club", "Mace", "Exceptional", 13, 25);
const FlangedMace = new Weapon("Flanged Mace", "Mace", "Exceptional", 15, 23);
const JaggedStar = new Weapon("Jagged Star", "Mace", "Exceptional", 20, 31);
const Knout = new Weapon("Knout", "Mace", "Exceptional", 13, 35);
const BattleHammer = new Weapon("BattleHammer", "Mace", "Exceptional", 35, 58);
const WarClub = new Weapon("War Club", "Mace", "Exceptional", 53, 78);
const MartelDeFer = new Weapon("Martel de Fer", "Mace", "Exceptional", 1, 6);
const Truncheon = new Weapon("Truncheon", "Mace", "Elite", 35, 43);
const TyrantClub = new Weapon("Tyrant Club", "Mace", "Elite", 32, 58);
const ReinforcedMace = new Weapon("ReinforcedMace", "Mace", "Elite", 41, 49);
const DevilStar = new Weapon("Devil Star", "Mace", "Elite", 43, 53);
const Scourge = new Weapon("Scourge", "Mace", "Elite", 3, 80);
const LegendaryMallet = new Weapon("Legendary Mallet", "Mace", "Elite", 50, 61);
const OgreMaul = new Weapon("OgreMaul", "Mace", "Elite", 77, 106);
const ThunderMaul = new Weapon("ThunderMaul", "Mace", "Elite", 33, 180);

const Scepter = new Weapon("Scepter", "Scepter", "Normal", 6, 11);
const GrandScepter = new Weapon("Grand Scepter", "Scepter", "Normal", 8, 18);
const WarScepter = new Weapon("War Scepter", "Scepter", "Normal", 10, 17);
const RuneScepter = new Weapon("Rune Scepter", "Scepter", "Exceptional", 13, 24);
const HolyWaterSprinkler = new Weapon("Holy Water Sprinkler", "Scepter", "Exceptional", 14, 36);
const DivineScepter = new Weapon("Divine Scepter", "Scepter", "Exceptional", 16, 38);
const MightyScepter = new Weapon("Mighty Scepter", "Scepter", "Elite", 40, 52);
const SeraphRod = new Weapon("Seraph Rod", "Scepter", "Elite", 45, 54);
const Caduceus = new Weapon("Caduceus", "Scepter", "Elite", 37, 43);

const Spear = new Weapon("Spear", "Spear", "Noraml", 3, 15);
const Trident = new Weapon("Trident", "Spear", "Noraml", 9, 15);
const Brandistock = new Weapon("Brandistock", "Spear", "Noraml", 7, 17);
const Spetum = new Weapon("Spetum", "Spear", "Noraml", 15, 23);
const Pike = new Weapon("Pike", "Spear", "Noraml", 14, 63);
const WarSpear = new Weapon("War Spear", "Spear", "Exceptional", 10, 37);
const Fuscina = new Weapon("Fuscina", "Spear", "Exceptional", 19, 37);
const WarFork = new Weapon("War Fork", "Spear", "Exceptional", 16, 40);
const Yari = new Weapon("Yari", "Spear", "Exceptional", 29, 59);
const Lance = new Weapon("Lance", "Spear", "Exceptional", 27, 114);
const HyperionSpear = new Weapon("Hyperion Spear", "Spear", "Elite", 35, 119);
const StygianPike = new Weapon("Stygian Pike", "Spear", "Elite", 29, 114);
const Mancatcher = new Weapon("Mancatcher", "Spear", "Elite", 42, 92);
const GhostSpear = new Weapon("Ghost Spear", "Spear", "Elite", 18, 155);
const WarPike = new Weapon("War Pike", "Spear", "Elite", 33, 178);

const ShortStaff = new Weapon("Short Staff", "Stave", "Normal", 1, 5);
const LongStaff = new Weapon("Long Staff", "Stave", "Normal", 2, 8);
const GnarledStaff = new Weapon("Gnarled Staff", "Stave", "Normal", 4, 12);
const BattleStaff = new Weapon("Battle Staff", "Stave", "Normal", 6, 13);
const WarStaff = new Weapon("War Staff", "Stave", "Normal", 12, 28);
const JoStaff = new Weapon("Jo Staff", "Stave", "Exceptional", 6, 21);
const Quarterstaff = new Weapon("Quarterstaff", "Stave", "Exceptional", 8, 26);
const CedarStaff = new Weapon("Cedar Staff", "Stave", "Exceptional", 11, 32);
const GothicStaff = new Weapon("Gothic Staff", "Stave", "Exceptional", 14, 34);
const RuneStaff = new Weapon("Rune Staff", "Stave", "Exceptional", 24, 58);
const WalkingStick = new Weapon("Walking Stick", "Stave", "Elite", 69, 85);
const Stalagmite = new Weapon("Stalagmite", "Stave", "Elite", 75, 107);
const ElderStaff = new Weapon("Elder Staff", "Stave", "Elite", 80, 93);
const Shillelagh = new Weapon("Shillelagh", "Stave", "Elite", 65, 108);
const ArchonStaff = new Weapon("Archon Staff", "Stave", "Elite", 83, 99);

const ShortSword = new Weapon("Short Sword", "Sword", "Normal", 2, 7);
const Scimitar = new Weapon("Scimitar", "Sword", "Normal", 2, 6);
const Sabre = new Weapon("Sabre", "Sword", "Normal", 3, 8);
const Falchion = new Weapon("Falchion", "Sword", "Normal", 9, 17);
const CrystalSword = new Weapon("Crystal Sword", "Sword", "Normal", 5, 15);
const BroadSword = new Weapon("Broad Sword", "Sword", "Normal", 7, 14);
const LongSword = new Weapon("Long Sword", "Sword", "Normal", 3, 19);
const WarSword = new Weapon("War Sword", "Sword", "Normal", 8, 20);
const TwoHandedSword = new Weapon("Two-Handed Sword", "Sword", "Normal", 8, 17);
const Claymore = new Weapon("Claymore", "Sword", "Normal", 13, 30);
const GiantSword = new Weapon("Giant Sword", "Sword", "Normal", 9, 28);
const BastardSword = new Weapon("Bastard Sword", "Sword", "Normal", 20, 28);
const Flamberge = new Weapon("Flamberge", "Sword", "Normal", 13, 26);
const GreatSword = new Weapon("Great Sword", "Sword", "Normal", 25, 42);
const Gladius = new Weapon("Gladius", "Sword", "Exceptional", 8, 22);
const Cutlass = new Weapon("Cutlass", "Sword", "Exceptional", 8, 21);
const Shamshir = new Weapon("Shamshir", "Sword", "Exceptional", 10, 24);
const Tulwar = new Weapon("Tulwar", "Sword", "Exceptional", 16, 35);
const DimensionialBlade = new Weapon("Dimensionial Blade", "Sword", "Exceptional", 13, 35);
const BattleSword = new Weapon("Battle Sword", "Sword", "Exceptional", 16, 34);
const RuneSword = new Weapon("Rune Sword", "Sword", "Exceptional", 10, 42);
const AncientSword = new Weapon("Ancient Sword", "Sword", "Exceptional", 18, 43);
const Espandon = new Weapon("Espandon", "Sword", "Exceptional", 18, 40);
const DacianFalx = new Weapon("Dacian Falx", "Sword", "Exceptional", 26, 61);
const TuskSword = new Weapon("Tusk Sword", "Sword", "Exceptional", 19, 58);
const GothicSword = new Weapon("Gothic Sword", "Sword", "Exceptional", 39, 60);
const Zweihander = new Weapon("Zweihander", "Sword", "Exceptional", 29, 54);
const ExecutionerSword = new Weapon("Executioner Sword", "Sword", "Exceptional", 47, 80);
const Falcata = new Weapon("Falcata", "Sword", "Elite", 31, 59);
const Ataghan = new Weapon("Ataghan", "Sword", "Elite", 26, 46);
const ElegantBlade = new Weapon("Elegant Blade", "Sword", "Elite", 33, 45);
const HydraEdge = new Weapon("Hydra Edge", "Sword", "Elite", 28, 68);
const PhaseBlade = new Weapon("Phase Blade", "Sword", "Elite", 31, 35);
const ConquestSword = new Weapon("Conquest Sword", "Sword", "Elite", 37, 53);
const CrypticSword = new Weapon("Cryptic Sword", "Sword", "Elite", 5, 77);
const MythicalSword = new Weapon("Mythical Sword", "Sword", "Elite", 40, 50);
const LegendSword = new Weapon("Legend Sword", "Sword", "Elite", 50, 94);
const HighlandBlade = new Weapon("Highland Blade", "Sword", "Elite", 67, 96);
const BalrogBlade = new Weapon("Balrog Blade", "Sword", "Elite", 55, 118);
const ChampionSword = new Weapon("Champion Sword", "Sword", "Elite", 71, 83);
const ColossusSword = new Weapon("Colossus Sword", "Sword", "Elite", 61, 121);
const ColossusBlade = new Weapon("Colossus Blade", "Sword", "Elite", 58, 115);

const ThrowingKnife = new Weapon("Throwing Knife", "Throwing", "Normal", 2, 3);
const BalancedKnife = new Weapon("Balanced Knife", "Throwing", "Normal", 1, 8);
const ThrowingAxe = new Weapon("Throwing Axe", "Throwing", "Normal", 4, 7);
const BalancedAxe = new Weapon("Balanced Axe", "Throwing", "Normal", 5, 10);
const BattleDart = new Weapon("Battle Dart", "Throwing", "Exceptional", 8, 16);
const WarDart = new Weapon("War Dart", "Throwing", "Exceptional", 11, 22);
const Francisca = new Weapon("Francisca", "Throwing", "Exceptional", 11, 22);
const Hurlbat = new Weapon("Hurlbat", "Throwing", "Exceptional", 13, 27);
const FlyingKnife = new Weapon("Flying Knife", "Throwing", "Elite", 23, 54);
const WingedKnife = new Weapon("Winged Knife", "Throwing", "Elite", 27, 35);
const FlyingAxe = new Weapon("Flying Axe", "Throwing", "Elite", 17, 65);
const WingedAxe = new Weapon("Winged Axe", "Throwing", "Elite", 11, 56);

const SmallCharm = new Base("Small Charm", "Charm", "Elite");
const LargeCharm = new Base("Large Charm", "Charm", "Elite");
const GrandCharm = new Base("Grand Charm", "Charm", "Elite");
const Annihilus = new Unique(SmallCharm, "Annihilus", 0, 0);
Annihilus.addAttr(new Attribute(AllAttributes, 10, 20));
Annihilus.addAttr(new Attribute(AllRes, 10, 20));
Annihilus.addAttr(new Attribute(ExperGained, 5, 10));
const HellfireTorch = new Unique(LargeCharm, "Hellfire Torch", 0, 0);
HellfireTorch.addAttr(new SkillAttribute(empty, "Torch type", "", ""));
HellfireTorch.addAttr(new Attribute(AllAttributes, 10, 20));
HellfireTorch.addAttr(new Attribute(AllRes, 10, 20));
const GheedsFortune = new Unique(GrandCharm, "Gheed's Fortune", 0, 0);
GheedsFortune.addAttr(new Attribute(GoldFind, 80, 160));
GheedsFortune.addAttr(new Attribute(RedcVendPrices, 10, 15));
GheedsFortune.addAttr(new Attribute(MagicFind, 20, 40));

const Rune = new Base("Rune", "Rune", "Elite");
const ElRune = new QuantizedItem(Rune, "El Rune", 0, null);
const EldRune = new QuantizedItem(Rune, "Eld Rune", 0, null);
const TirRune = new QuantizedItem(Rune, "Tir Rune", 0, null);
const NefRune = new QuantizedItem(Rune, "Nef Rune", 0, null);
const EthRune = new QuantizedItem(Rune, "Eth Rune", 0, null);
const IthRune = new QuantizedItem(Rune, "Ith Rune", 0, null);
const TalRune = new QuantizedItem(Rune, "Tal Rune", 0, null);
const RalRune = new QuantizedItem(Rune, "Ral Rune", 0, null);
const OrtRune = new QuantizedItem(Rune, "Ort Rune", 0, null);
const ThulRune = new QuantizedItem(Rune, "Thul Rune", 0, null);
const AmnRune = new QuantizedItem(Rune, "Amn Rune", 0, null);
const SolRune = new QuantizedItem(Rune, "Sol Rune", 0, null);
const ShaelRune = new QuantizedItem(Rune, "Shael Rune", 0, null);
const DolRune = new QuantizedItem(Rune, "Dol Rune", 0, null);
const HelRune = new QuantizedItem(Rune, "Hel Rune", 0, null);
const IoRune = new QuantizedItem(Rune, "Io Rune", 0, null);
const LumRune = new QuantizedItem(Rune, "Lum Rune", 0, null);
const KoRune = new QuantizedItem(Rune, "Ko Rune", 0, null);
const FalRune = new QuantizedItem(Rune, "Fal Rune", 0, null);
const LemRune = new QuantizedItem(Rune, "Lem Rune", 0, null);
const PulRune = new QuantizedItem(Rune, "Pul Rune", 0, null);
const UmRune = new QuantizedItem(Rune, "Um Rune", 0, null);
const MalRune = new QuantizedItem(Rune, "Mal Rune", 0, null);
const IstRune = new QuantizedItem(Rune, "Ist Rune", 0, null);
const GulRune = new QuantizedItem(Rune, "Gul Rune", 0, null);
const VexRune = new QuantizedItem(Rune, "Vex Rune", 0, null);
const OhmRune = new QuantizedItem(Rune, "Ohm Rune", 0, null);
const LoRune = new QuantizedItem(Rune, "Lo Rune", 0, null);
const SurRune = new QuantizedItem(Rune, "Sur Rune", 0, null);
const BerRune = new QuantizedItem(Rune, "Ber Rune", 0, null);
const JahRune = new QuantizedItem(Rune, "Jah Rune", 0, null);
const ChamRune = new QuantizedItem(Rune, "Cham Rune", 0, null);
const ZodRune = new QuantizedItem(Rune, "Zod Rune", 0, null);

const Jewel = new Base("Jewel", "Jewel", "Elite");
const RainbowFacetCold = new Unique(Jewel, "Rainbow Facet - Cold", 0, 0)
RainbowFacetCold.addAttr(new Attribute(ColdDmgPerc, 3, 5));
RainbowFacetCold.addAttr(new Attribute(EnemyColdResist, 3, 5));
RainbowFacetCold.addAttr(new SkillAttribute(empty, "Level/Die", "", ""))
const RainbowFacetFire = new Unique(Jewel, "Rainbow Facet - Fire", 0, 0)
RainbowFacetFire.addAttr(new Attribute(FireDmgPerc, 3, 5));
RainbowFacetFire.addAttr(new Attribute(EnemyFireResist, 3, 5));
RainbowFacetFire.addAttr(new SkillAttribute(empty, "Level/Die", "", ""))
const RainbowFacetLightning = new Unique(Jewel, "Rainbow Facet - Lightning", 0, 0)
RainbowFacetLightning.addAttr(new Attribute(LightDmgPerc, 3, 5));
RainbowFacetLightning.addAttr(new Attribute(EnemyLightResist, 3, 5));
RainbowFacetLightning.addAttr(new SkillAttribute(empty, "Level/Die", "", ""))
const RainbowFacetPoison = new Unique(Jewel, "Rainbow Facet - Poison", 0, 0)
RainbowFacetPoison.addAttr(new SkillAttribute(empty, "Level/Die", "", ""))
RainbowFacetPoison.addAttr(new SkillAttribute(empty, "Color", "", ""))
RainbowFacetPoison.addAttr(new Attribute(PsntDmgPerc, 3, 5));
RainbowFacetPoison.addAttr(new Attribute(EnemyPsnResist, 3, 5));

const Key = new Base("Key", "Key", "Elite");
const KeyOfTerror = new QuantizedItem(Key, "Key of Terror", 0, null);
const KeyOfHate = new QuantizedItem(Key, "Key of Hate", 0, null);
const KeyOfDestruction = new QuantizedItem(Key, "Key of Desctruction", 0, null);

const Essence = new Base("Essence", "Essence", "Elite");
const TwistedEssenceOfSuffering = new QuantizedItem(Essence, "Twisted Essence of Suffering", 0, null);
const ChargedEssenceOfHatred = new QuantizedItem(Essence, "Charged Essence of Hatred", 0, null);
const BurningEssenceOfTerror = new QuantizedItem(Essence, "Burning Essence of Terror", 0, null);
const FesteringEssenceOfDestruction = new QuantizedItem(Essence, "Festering Essence of Destruction", 0, null);
const TokenOfAbsolution = new QuantizedItem(Essence, "Token of Absolution", 0, null);

const Potion = new Base("Potion", "Potion", "Elite");
const FullRejuvenationPotion = new QuantizedItem(Potion, "Full Rejuvenation Potion", 0, null);

const Gem = new Base("Gem", "Gem", "Elite");
const FlawlessRuby = new QuantizedItem(Gem, "Flawless Ruby", 0, null);
const PerfectRuby = new QuantizedItem(Gem, "Perfect Ruby", 0, null);
const FlawlessSapphire = new QuantizedItem(Gem, "Flawless Sapphire", 0, null);
const PerfectSapphire = new QuantizedItem(Gem, "Perfect Sapphire", 0, null);
const FlawlessTopaz = new QuantizedItem(Gem, "Flawless Topaz", 0, null);
const PerfectTopaz = new QuantizedItem(Gem, "Perfect Topaz", 0, null);
const FlawlessEmerald = new QuantizedItem(Gem, "Flawless Emerald", 0, null);
const PerfectEmerald = new QuantizedItem(Gem, "Perfect Emerald", 0, null);
const FlawlessDiamond = new QuantizedItem(Gem, "Flawless Diamond", 0, null);
const PerfectDiamond = new QuantizedItem(Gem, "Perfect Diamond", 0, null);
const FlawlessAmethyst = new QuantizedItem(Gem, "Flawless Amethyst", 0, null);
const PerfectAmethyst = new QuantizedItem(Gem, "Perfect Amethyst", 0, null);
const FlawlessSkull = new QuantizedItem(Gem, "Flawless Skull", 0, null);
const PerfectSkull = new QuantizedItem(Gem, "Perfect Skull", 0, null);

const Amulet = new Base("Amulet", "Amulet", "Elite");
const NokozanRelic = new Unique(Amulet, "Nokozan Relic", 0, 0);
const EyeOfTheEtlich = new Unique(Amulet, "Eye of Etlich", 0, 0);
EyeOfTheEtlich.addAttr(new Attribute(LightRad, 1, 5));
EyeOfTheEtlich.addAttr(new Attribute(LifeSteal, 3, 7));
EyeOfTheEtlich.addAttr(new TwoFieldAttribute(ColdDmg, 1, 2, 3, 5));
EyeOfTheEtlich.addAttr(new Attribute(DefVsMisl, 10, 40));
const MahimOakCurio = new Unique(Amulet, "Mahim-Oak Curio", 0, 0);
const SaracensChance = new Unique(Amulet, "Saracen's Chance", 0, 0);
SaracensChance.addAttr(new Attribute(AllRes, 15, 25));
const CatsEye = new Unique(Amulet, "Cat's Eye", 0, 0);
const CrescentMoon = new Unique(Amulet, "Crescent Moon", 0, 0);
CrescentMoon.addAttr(new Attribute(LifeSteal, 3, 6));
CrescentMoon.addAttr(new Attribute(ManaSteal, 11, 15));
const AtmasScarab = new Unique(Amulet, "Atma's Scarab", 0, 0);
const RisingSun = new Unique(Amulet, "Rising Sun", 0, 0);
const HighlordsWrath = new Unique(Amulet, "Highlord's Wrath", 0, 0);
const MarasKaleidoscope = new Unique(Amulet, "Mara's Kaleidoscope", 0, 0);
MarasKaleidoscope.addAttr(new Attribute(AllRes, 20, 30));
const SeraphsHymn = new Unique(Amulet, "Seraph's Hymn", 0, 0);
SeraphsHymn.addAttr(new SkillAttribute(empty, "Defensive Auras", 1, 2));
SeraphsHymn.addAttr(new Attribute(DmgDemon, 20, 50));
SeraphsHymn.addAttr(new Attribute(ArDemon, 150, 250));
SeraphsHymn.addAttr(new Attribute(DmgUndead, 20, 50));
SeraphsHymn.addAttr(new Attribute(ArUndead, 150, 250));
const Metalgrid = new Unique(Amulet, "Metalgrid", 0, 0);
Metalgrid.addAttr(new Attribute(Ar, 400, 450));
Metalgrid.addAttr(new Attribute(AllRes, 25, 35));
Metalgrid.addAttr(new Attribute(Def, 300, 350));

const Ring = new Base("Ring", "Ring", "Elite");
const Nagelring = new Unique(Ring, "Nagelring", 0, 0);
Nagelring.addAttr(new Attribute(Ar, 50, 75));
Nagelring.addAttr(new Attribute(MagicFind, 15, 30));
const ManaldHeal = new Unique(Ring, "Manald Heal", 0, 0);
ManaldHeal.addAttr(new Attribute(ManaSteal, 4, 7));
ManaldHeal.addAttr(new Attribute(ReplLife, 5, 8));
const StoneOfTheJordan = new Unique(Ring, "Stone of the Jordan", 0, 0);
const DwarfStar = new Unique(Ring, "Dwarf Star", 0, 0);
DwarfStar.addAttr(new Attribute(MageDmgReduce, 12, 15));
const RavenFrost = new Unique(Ring, "RavenFrost", 0, 0);
RavenFrost.addAttr(new Attribute(Ar, 150, 250));
RavenFrost.addAttr(new Attribute(Dex, 15, 20));
const BulKathosWeddingBand = new Unique(Ring, "BK Bul-Katho's Wedding Band", 0, 0);
BulKathosWeddingBand.addAttr(new Attribute(LifeSteal, 3, 5));
const CarrionWind = new Unique(Ring, "Carrion Wind", 0, 0);
CarrionWind.addAttr(new Attribute(LifeSteal, 6, 9));
CarrionWind.addAttr(new Attribute(DefVsMisl, 100, 160));
const NaturesPeace = new Unique(Ring, "Nature's Peace", 0, 0);
NaturesPeace.addAttr(new Attribute(PsnRes, 20, 30));
NaturesPeace.addAttr(new Attribute(DmgReduce, 7, 11));
const WispProjector = new Unique(Ring, "Wisp Projector", 0, 0);
WispProjector.addAttr(new Attribute(LightAbsorbPerc, 10, 20));
WispProjector.addAttr(new Attribute(MagicFind, 10, 20));

const AngelicSickle = new SetItem(Sabre, "Angelic Sickle", 0, 0, "Angelic Raiment");
const AngelicMantle = new SetItem(RingMail, "Angelic Mantle", 40, 0, "Angelic Raiment");
AngelicMantle.addAttr(new BasicAttribute(EnhancedDef, 40))
const AngelicHalo = new SetItem(Ring, "Angelic Halo", 0, 0, "Angelic Raiment");
const AngelicWings = new SetItem(Amulet, "Angelic Wings", 0, 0, "Angelic Raiment");

const ArcannasSign = new SetItem(Amulet, "Arcanna's Sign", 0, 0, "Arcanna's Tricks");
const ArcannasDeathwand = new SetItem(WarStaff, "Arcanna's Deathwand", 0, 0, "Arcanna's Tricks");
const ArcannasHead = new SetItem(SkullCap, "Arcanna's Head", 0, 0, "Arcanna's Tricks");
const ArcannasFlesh = new SetItem(LightPlate, "Arcanna's Flesh", 0, 0, "Arcanna's Tricks");

const ArticFurs = new SetItem(QuiltedArmor, "Artic Furs", 0, 0, "Artic Gear");
ArticFurs.addAttr(new Attribute(EnhancedDef, 275, 325));
const ArticBinding = new SetItem(LightBelt, "Artic Binding", 0, 0, "Artic Gear");
const ArticMitts = new SetItem(LightGauntlets, "Artic Mitts", 0, 0, "Artic Gear");
const ArticHorn = new SetItem(ShortWarBow, "Artic Horn", 0, 0, "Artic Gear");

const BerserkersHeadgear = new SetItem(Helm, "Berserker's Headgear", 0, 15, "Berserker's Arsenal");
const BerserkersHauberk = new SetItem(SplintMail, "Berserker's Hauberk", 0, 0, "Berserker's Arsenal");
const BerserkersHatchet = new SetItem(DoubleAxe, "Berserker's Hatchet", 0, 0, "Berserker's Arsenal");

const CathansRule = new SetItem(BattleStaff, "Cathan's Rule", 0, 0, "Cathan's Traps");
const CathansMesh = new SetItem(ChainMail, "Cathan's Mesh", 0, 15, "Cathan's Traps");
const CathansVisage = new SetItem(Mask, "Cathan's Visage", 0, 0, "Cathan's Traps");
const CathansSigil = new SetItem(Amulet, "Cathan's Sigil", 0, 0, "Cathan's Traps");
const CathansSeal = new SetItem(Ring, "Cathan's Seal", 0, 0, "Cathan's Traps");

const CiverbsWard = new SetItem(LargeShield, "Civerb's Ward", 0, 15, "Civerb's Vestments");
const CiverbsIcon = new SetItem(Amulet, "Civerb's Icon", 0, 0, "Civerb's Vestments");
const CiverbsCudgel = new SetItem(GrandScepter, "Civerb's Cudgel", 0, 0, "Civerb's Vestments");

const CleglawsTooth = new SetItem(LongSword, "Cleglaw's Tooth", 0, 0, "Cleglaw's Brace");
const CleglawsClaw = new SetItem(SmallShield, "Cleglaw's Claw", 0, 17, "Cleglaw's Brace");
const CleglawsPincers = new SetItem(LongSword, "Cleglaw's Pincers", 0, 0, "Cleglaw's Brace");

const DeathsHand = new SetItem(LeatherGloves, "Death's Hand", 0, 0, "Death's Disguise");
const DeathsTouch = new SetItem(WarSword, "Death's Touch", 0, 0, "Death's Disguise");
const DeathsGuard = new SetItem(Sash, "Death's Guard", 0, 0, "Death's Disguise");

const HsarusIronHeel = new SetItem(ChainBoots, "Hsarus' Iron Heel", 0, 0, "Hsarus' Defense");
const HsarusIronFist = new SetItem(Buckler, "Hsarus' Iron Fist", 0, 0, "Hsarus' Defense");
const HsarusIronStay = new SetItem(Belt, "Hsarus' Iron Stay", 0, 0, "Hsarus' Defense");

const InfernalCranium = new SetItem(Cap, "Infernal Cranium", 0, 0, "Infernal Tools");
const InfernalTorch = new SetItem(GrimWand, "Infernal Torch", 0, 0, "Infernal Tools");
const InfernalSign = new SetItem(HeavyBelt, "Infernal Sign", 0, 0, "Infernal Tools");

const IrathasCollar = new SetItem(Amulet, "Iratha's Collar", 0, 0, "Iratha's Finery");
const IrathasCuff = new SetItem(LightGauntlets, "Iratha's Cuff", 0, 0, "Iratha's Finery");
const IrathasCoil = new SetItem(Crown, "Iratha's Coil", 0, 0, "Iratha's Finery");
const IrathasCord = new SetItem(Cap, "Iratha's Cord", 0, 25, "Iratha's Finery");

const IsenhartsLightbrand = new SetItem(BroadSword, "Isenhart's Lightbrand", 0, 0, "Isenhart's Armory");
const IsenhartsParry = new SetItem(GothicShield, "Isenhart's Parry", 0, 40, "Isenhart's Armory");
const IsenhartsCase = new SetItem(BreastPlate, "Isenhart's Case", 0, 40, "Isenhart's Armory");
const IsenhartsHorns = new SetItem(FullHelm, "Isenhart's Horns", 0, 0, "Isenhart's Armory");

const MilabregasOrb = new SetItem(KiteShield, "Milabrega's Orb", 0, 25, "Milabrega's Regalia");
const MilabregasRod = new SetItem(WarScepter, "Milabrega's Rod", 0, 0, "Milabrega's Regalia");
const MilabregasDiadem = new SetItem(Crown, "Milabrega's Diadem", 0, 0, "Milabrega's Regalia");
const MilabregasRobe = new SetItem(AncientArmor, "Milabrega's Robe", 0, 0, "Milabrega's Regalia");

const SigonsVisor = new SetItem(GreatHelm, "Sigon's Visor", 25, 0, "Sigon's Complete SteelSigon's Visor");
const SigonsShelter = new SetItem(GothicPlate, "Sigon's Shelter", 25, 0, "Sigon's Complete SteelSigon's Visor");
const SigonsGage = new SetItem(Gauntlets, "Sigon's Gage", 0, 0, "Sigon's Complete SteelSigon's Visor");
const SigonsSabot = new SetItem(Greaves, "Sigon's Sabot", 0, 0, "Sigon's Complete SteelSigon's Visor");
const SigonsWrap = new SetItem(PlatedBelt, "Sigon's Wrap", 0, 0, "Sigon's Complete SteelSigon's Visor");
const SigonsGuard = new SetItem(TowerShield, "Sigon's Guard", 0, 0, "Sigon's Complete SteelSigon's Visor");

const TancredsSpine = new SetItem(FullPlateMail, "Tancred's Spine", 0, 0, "Tancred's Battlegear");
const TancredsCrowbill = new SetItem(MiliatryPick, "Tancred's Crowbill", 0, 0, "Tancred's Battlegear");
const TancredsHobnails = new SetItem(Boots, "Tancred's Hobnails", 0, 0, "Tancred's Battlegear");
const TancredsWeird = new SetItem(Amulet, "Tancred's Weird", 0, 0, "Tancred's Battlegear");
const TancredsSkull = new SetItem(BoneHelm, "Tancred's Skull", 0, 0, "Tancred's Battlegear");

const VidalasBarb = new SetItem(LongBattleBow, "Vidala's Barb", 0, 0, "Vidala's Rig");
const VidalasFetlock = new SetItem(LightPlatedBoots, "Vidala's Fetlock", 0, 0, "Vidala's Rig");
const VidalasAmbush = new SetItem(LeatherArmor, "Vidala's Ambush", 0, 50, "Vidala's Rig");
const VidalasSnare = new SetItem(Amulet, "Vidala's Snare", 0, 0, "Vidala's Rig");

const BulKathosSacredCharge = new SetItem(ColossusBlade, "Bul-Kathos Sacred Charge", 0, 0, "Bul-Katho's Children");
const BulKathosTribaGuardian = new SetItem(MythicalSword, "Bul-Kathos Tribal Guardian", 0, 0, "Bul-Katho's Children");

const CowKingsHorns = new SetItem(WarHat, "Cow King's Horns", 0, 75, "Cow King's Leathers");
const CowKingsHide = new SetItem(StuddedLeather, "Cow King's Hide", 60, 0, "Cow King's Leathers");
const CowKingsHooves = new SetItem(HeavyBoots, "Cow King's Hooves", 0, 0, "Cow King's Leathers");
CowKingsHooves.addAttr(new Attribute(Def, 25, 35));

const DangoonsTeaching = new SetItem(ReinforcedMace, "Dangoon's Teaching", 0, 0, "Heaven's Brethren");
const TaebaeksGlory = new SetItem(Ward, "Taebaek's Glory", 0, 50, "Heaven's Brethren");
const HaemosusAdamant = new SetItem(Cuirass, "Haemosu's Adamant", 0, 500, "Heaven's Brethren");
const OndalsAlmighty = new SetItem(SpiredHelm, "Ondal's Almighty", 0, 50, "Heaven's Brethren");

const HwaninsSplendor = new SetItem(GrandCrown, "Hwanin's Splendor", 100, 0, "Hwanin's Majesty");
const HwaninsRefuge = new SetItem(TigulatedMail, "Hwanin's Refuge", 200, 0, "Hwanin's Majesty");
const HwaninsBlessing = new SetItem(Belt, "Hwanin's Blessing", 0, 0, "Hwanin's Majesty");
const HwaninsJustice = new SetItem(Bill, "Hwanin's Justice", 0, 0, "Hwanin's Majesty");

const NajsPuzzler = new SetItem(ElderStaff, "Naj's Puzzler", 0, 0, "Naj's Ancient Vestige");
const NajsLightPlate = new SetItem(HellforgePlate, "Naj's Light Plate", 0, 300, "Naj's Ancient Vestige");
const NajsCirclet = new SetItem(Circlet, "Naj's Circlet", 0, 75, "Naj's Ancient Vestige");

const GuillaumesFace = new SetItem(WingedHelm, "Guillaume's Face", 120, 0, "Orphan's Call");
const WilhelmsPride = new SetItem(BattleBelt, "Wilhelm's Pride", 75, 0, "Orphan's Call");
const MagnusSkin = new SetItem(SharkskinGloves, "Magnus' Skin", 50, 0, "Orphan's Call");
const WhitstansGuard = new SetItem(RoundShield, "Whitstan's Guard", 0, 0, "Orphan's Call");

const SandersParagon = new SetItem(Cap, "Sander's Paragon", 0, 0, "Sander's Folly");
const SandersRiprap = new SetItem(HeavyBoots, "Sander's Riprap", 0, 0, "Sander's Folly");
const SandersTaboo = new SetItem(HeavyGloves, "Sander's Taboo", 0, 0, "Sander's Folly");
SandersTaboo.addAttr(new Attribute(Def, 20, 25));
const SandersSuperstition = new SetItem(BoneWand, "Sander's Superstition", 0, 0, "Sander's Folly");
SandersSuperstition.addAttr(new Attribute(ColdDmg, 25, 75));
const SazabisCobaltRedeemer = new SetItem(CrypticSword, "Sazabi's Cobalt Redeemer", 0, 0, "Sazabi's Grand Tribute");
const SazabisGhostLiberator = new SetItem(BalrogSkin, "Sazabi's Ghost Liberator", 0, 400, "Sazabi's Grand Tribute");
SazabisGhostLiberator.addAttr(new Attribute(Life, 25, 75))
const SazabisMentalSheath = new SetItem(Basinet, "Sazabi's Mental Sheath", 0, 100, "Sazabi's Grand Tribute");
SazabisMentalSheath.addAttr(new Attribute(LightRes, 15, 20));
SazabisMentalSheath.addAttr(new Attribute(FireRes, 15, 20));

const TellingOfBeads = new SetItem(Amulet, "Telling of Beads", 0, 0, "The Disciple");
TellingOfBeads.addAttr(new Attribute(PsnRes, 35, 50));
const LayingOfHands = new SetItem(BrambleMitts, "Laying of Hands", 0, 25, "The Disciple");
const RiteOfPassage = new SetItem(DemonhideBoots, "Rite of Passage", 0, 25, "The Disciple");
RiteOfPassage.addAttr(new Attribute(MaxStam, 15, 25));
const DarkAdherent = new SetItem(DuskShroud, "Dark Adherent", 0, 0, "The Disciple");
DarkAdherent.addAttr(new Attribute(Def, 305, 415));
const Credendum = new SetItem(MithrilCoil, "Credendum", 0, 50, "The Disciple");

const AldursStonyGaze = new SetItem(HuntersGuise, "Aldur's Stony Gaze", 0, 90, "Aldur's Watchtower");
AldursStonyGaze.addAttr(new Attribute(ColdRes, 40, 50));
AldursStonyGaze._base._sockets = 2;
const AldursDeception = new SetItem(ShadowPlate, "Aldur's Deception", 0, 300, "Aldur's Watchtower");
AldursDeception.addAttr(new Attribute(LightRes, 40, 50));
const AldursRhythm = new SetItem(JaggedStar, "Aldur's Rhythm", 0, 0, "Aldur's Watchtower");
AldursRhythm.addAttr(new Attribute(OpenSockets, 2, 3));
const AldursAdvance = new SetItem(BattleBoots, "Aldur's Advance", 0, 0, "Aldur's Watchtower");
AldursAdvance.addAttr(new Attribute(FireRes, 40, 50));

const GriswoldsValor = new SetItem(Corona, "Griswold's Valor", 0, 0, "Griswold's Legacy");
GriswoldsValor.addAttr(new Attribute(EnhancedDef, 50, 75));
GriswoldsValor.addAttr(new Attribute(MagicFind, 20, 30));
const GriswoldsHeart = new SetItem(OrnatePlate, "Griswold's Heart", 0, 500, "Griswold's Legacy");
const GriswoldsRedemption = new SetItem(Caduceus, "Griswold's Redemption", 0, 0, "Griswold's Legacy");
GriswoldsRedemption.addAttr(new Attribute(EnhancedDmg, 200, 240));
GriswoldsRedemption.addAttr(new Attribute(OpenSockets, 3, 4));
const GriswoldsHonor = new SetItem(VortexShield, "Griswold's Honor", 0, 108, "Griswold's Legacy");

const ImmortalKingsWill = new SetItem(AvengerGuard, "Immortal King's Will", 0, 125, "Immortal King");
ImmortalKingsWill.addAttr(new Attribute(MagicFind, 25, 40));
const ImmortalKingsSoulCage = new SetItem(SacredArmor, "Immortal King's Soul Cage", 0, 400, "Immortal King");
const ImmortalKingsDetail = new SetItem(WarBelt, "Immortal King's Detail", 0, 36, "Immortal King");
const ImmortalKingsForge = new SetItem(WarGauntlets, "Immortal King's Forge", 0, 65, "Immortal King");
const ImmortalKingsPillar = new SetItem(WarBoots, "Immortal King's Pillar", 0, 75, "Immortal King");
const ImmortalKingsStoneCrusher = new SetItem(OgreMaul, "Immortal King's Stone Crusher", 0, 0, "Immortal King");
ImmortalKingsStoneCrusher.addAttr(new Attribute(CrushingBlow, 35, 40));

const MavinasTrueSight = new SetItem(Diadem, "M'avina's True Sight", 0, 150, "M'avina's Battle Hymn");
const MavinasEmbrace = new SetItem(KrakenShell, "M'avina's Embrace", 0, 350, "M'avina's Battle Hymn");
MavinasEmbrace.addAttr(new Attribute(MageDmgReduce, 5, 12));
const MavinasIcyClutch = new SetItem(BattleGauntlets, "M'avina's Icy Clutch", 0, 0, "M'avina's Battle Hymn");
MavinasIcyClutch.addAttr(new Attribute(Def, 45, 50));
const MavinasTenet = new SetItem(SharkskinBelt, "M'avina's Tenett", 0, 50, "M'avina's Battle Hymn");
const MavinasCaster = new SetItem(GrandMatronBow, "M'avina's Caster", 0, 0, "M'avina's Battle Hymn");

const NatalyasTotem = new SetItem(GrimHelm, "Natalya's Totem", 0, 0, "Natalya's Odium");
NatalyasTotem.addAttr(new Attribute(Def, 135, 175));
NatalyasTotem.addAttr(new Attribute(AllRes, 10, 20));
NatalyasTotem.addAttr(new Attribute(20, 30));
NatalyasTotem.addAttr(new Attribute(Str, 10, 20));
const NatalyasMark = new SetItem(ScissorsSuwayyah, "Natalya's Mark", 0, 0, "Natalya's Odium");
const NatalyasShadow = new SetItem(LoricatedMail, "Natalya's Shadow", 0, 0, "Natalya's Odium");
NatalyasShadow.addAttr(new Attribute(Def, 150, 225));
NatalyasShadow.addAttr(new Attribute(OpenSockets, 1, 3));
const NatalyasSoul = new SetItem(MeshBoots, "Natalya's Soul", 0, 0, "Natalya's Odium");
NatalyasSoul.addAttr(new Attribute(Def, 75, 125));
NatalyasSoul.addAttr(new Attribute(ColdRes, 15, 25));
NatalyasSoul.addAttr(new Attribute(LightRes, 15, 25));

const TalRashasFineSpunCloth = new SetItem(MeshBelt, "Tal Rasha's Fine Spun Cloth", 0, 0, "Tal Rasha's Wrappings");
TalRashasFineSpunCloth.addAttr(new Attribute(MagicFind, 10, 15));
const TalRashasAdjudication = new SetItem(Amulet, "Tal Rasha's Adjudication", 0, 0, "Tal Rasha's Wrappings");
const TalRashasLidlessEye = new SetItem(SwirlingCrystal, "Tal Rasha's Lidless Eye", 0, 0, "Tal Rasha's Wrappings");
TalRashasLidlessEye.addAttr(new SkillAttribute(empty, "Lightning Mastery", 1, 2));
TalRashasLidlessEye.addAttr(new SkillAttribute(empty, "Fire Mastery", 1, 2));
TalRashasLidlessEye.addAttr(new SkillAttribute(empty, "Cold Mastery", 1, 2));
const TalRashasGuardianship = new SetItem(LacqueredPlate, "Tal Rasha's Guardianship", 0, 400, "Tal Rasha's Wrappings");
const TalRashasHoradricCrest = new SetItem(DeathMask, "Tal Rasha's Horadric Crest", 0, 45, "Tal Rasha's Wrappings");
const TrangOulsClaws = new SetItem(HeavyBracers, "Trang-Oul's Claws", 0, 30, "Trang-Oul's Avatar");
const TrangOulsGirth = new SetItem(TrollBelt, "Trang-Oul's Girth", 0, 0, "Trang-Oul's Avatar");
TrangOulsGirth.addAttr(new Attribute(Def, 75, 100));

const TrangOulsGuise = new SetItem(BoneVisage, "Trang-Oul's Guise", 0, 0, "Trang-Oul's Avatar");
TrangOulsGuise.addAttr(new Attribute(Def, 80, 100));
const TrangOulsScales = new SetItem(ChaosArmor, "Trang-Oul's Scales", 150, 0, "Trang-Oul's Avatar");
const TrangOulsWing = new SetItem(CantorTrophy, "Trang-Oul's Wing", 0, 125, "Trang-Oul's Avatar");
TrangOulsWing.addAttr(new Attribute(FireRes, 38, 45));

const Services = new Base("Socket", "Services", "Elite");
const SocketQuest = new QuantizedItem(Services, "Socket quest", 0, null);

const NormRush = new Unique(Services, "Normal Rush", 0, null);
const NmRush = new Unique(Services, "Nightmare Rush", 0, null);
const HellRush = new Unique(Services, "Hell Rush", 0, null);
const IzzyQuest = new Unique(Services, "Hell Izzy", 0, null);
const DiabloQuest = new Unique(Services, "Hell Diablo", 0, null);
const Ancients = new Unique(Services, "Hell Ancients", 0, null);
const Chant = new Unique(Services, "Single Enchant", 0, null);
Chant.addAttr(new SkillAttribute(empty, "Enchant level", 0, 0));
Chant.addAttr(new SkillAttribute(empty, "Enchant damage: ", 0, 0));
Chant.addAttr(new SkillAttribute(empty, "Enchant duration: ", 0, 0));
const ChantGame = new Unique(Services, "Enchant game", 0, null);
ChantGame.addAttr(new SkillAttribute(empty, "Enchant level", 0, 0));
ChantGame.addAttr(new SkillAttribute(empty, "Enchant damage: ", 0, 0));
const HellBumper = new Unique(Services, "Hell Bumper", 0, null);
const Grush = new Unique(Services, "Grush", 0, null);
const PlayersEar = new Unique(Services, "Custom player's ear", 0, null);

const Steel = new RuneWord("Steel", [
], ["Sword", "Axe", "Mace"]);
const Nadir = new RuneWord("Nadir", [
  new Attribute(EnhancedDef, 50, 50),
  new Attribute(Def, 10, 10)
], ["Helm"]);
const Malice = new RuneWord("Malice", [
], []);
const Stealth = new RuneWord("Stealth", [
], ["Armor"]);
const Leaf = new RuneWord("Leaf", [
], ["Stave"]);
const HolyThunder = new RuneWord("Holy Thunder", [
], ["Scepter"]);
const Zephyr = new RuneWord("Zephyr", [
], ["Polearm", "Stave"]);
const AncientsPledge = new RuneWord("Ancient's Pledge", [
  new BasicAttribute(EnhancedDef, 50)
], []);
const Pattern = new RuneWord("Pattern", [
], ["Katar"]);
const Strength = new RuneWord("Strength", [
], []);
const Spirit = new RuneWord("Spirit", [
  new Attribute(FCR, 25, 35),
  new Attribute(Mana, 89, 112),
  new Attribute(MagicAbsorb, 3, 8)
], []);
const KingsGrace = new RuneWord("King's Grace", [
], ["Sword", "Scepter"]);
const Edge = new RuneWord("Edge", [
  new Attribute(DmgDemon, 320, 380),
  new Attribute(AllAttributes, 5, 10)
], []);
const Honor = new RuneWord("Honor", [
], []);
const Radiance = new RuneWord("Radiance", [
  new BasicAttribute(EnhancedDef, 75)
], ["Helm"]);
const Insight = new RuneWord("Insight", [
  new SkillAttribute(empty, "Meditation Aura", 12, 17),
  new Attribute(EnhancedDmg, 200, 260),
  new Attribute(ArPerc, 180, 250),
  new SkillAttribute(empty, "Critical Strike", 1, 6)
], []);
const Lore = new RuneWord("Lore", [
], ["Helm"]);
const Peace = new RuneWord("Peace", [
], ["Armor"]);
const Rhyme = new RuneWord("Rhyme", [
], []);
const Myth = new RuneWord("Myth", [
], ["Armor"]);
const White = new RuneWord("White", [
], ["Wand"]);
const Memory = new RuneWord("Memory", [
], ["Stave"]);
const Black = new RuneWord("Black", [
], ["Club", "Hammer", "Mace"]);
const Splendor = new RuneWord("Splendor", [
  new Attribute(EnhancedDef, 60, 100)
], []);
const Smoke = new RuneWord("Smoke", [
  new BasicAttribute(EnhancedDef, 75)
], ["Armor"]);
const Harmony = new RuneWord("Harmony", [
  new Attribute(EnhancedDmg, 200, 275),
  new SkillAttribute(empty, "Valkyrie", 2, 6)
], []);
const Melody = new RuneWord("Melody", [
], []);
const Lionheart = new RuneWord("Lionheart", [
], ["Armor"]);
const UnbendingWill = new RuneWord("Unbending Will", [
  new Attribute(IAS, 20, 30),
  new Attribute(EnhancedDmg, 300, 350),
  new Attribute(LifeSteal, 8, 10)
], ["Sword"]);
const Obedience = new RuneWord("Obedience", [
  new Attribute(Def, 200, 300),
  new Attribute(AllRes, 20, 30)
], ["Polearm", "Spear"]);
const Wealth = new RuneWord("Wealth", [
], ["Armor"]);
const VoiceOfReason = new RuneWord("VoiceOfReason", [
  new Attribute(DmgDemon, 220, 350),
  new Attribute(DmgUndead, 355, 375),
], ["Sword", "Mace"]);
const Treachery = new RuneWord("Treachery", [
], ["Armor"]);
const Passion = new RuneWord("Passion", [
  new BasicAttribute(EnhancedDmg, 75),
  new Attribute(ArPerc, 50, 80)
], []);
const Lawbringer = new RuneWord("Lawbringer", [
  new SkillAttribute(empty, "Sanctuary", 16, 18),
  new Attribute(DefVsMisl, 200, 250)
], ["Sword", "Hammer", "Scepter"]);
const Enlightenment = new RuneWord("Enlightenment", [
], ["Armor"]);
const Wisdom = new RuneWord("Wisdom", [
  new Attribute(ArPerc, 15, 25),
  new Attribute(ManaSteal, 4, 8),
  new BasicAttribute(EnhancedDef, 30)
], ["Helm"]);
const Gloom = new RuneWord("Gloom", [
  new Attribute(EnhancedDef, 200, 260)
], ["Armor"]);
const Bone = new RuneWord("Bone", [
  new Attribute(Mana, 100, 150)
], ["Armor"]);
const Stone = new RuneWord("Stone", [
  new Attribute(EnhancedDef, 250, 290)
], ["Armor"]);
const CrescentMoonRuneWord = new RuneWord("Crescent Moon", [
  new Attribute(EnhancedDmg, 180, 220),
  new Attribute(MagicAbsorb, 9, 11)
], ["Polearm", "Axe", "Sword"]);
const Duress = new RuneWord("Duress", [
  new Attribute(EnhancedDmg, 10, 20),
  new Attribute(EnhancedDef, 150, 200)
], ["Armor"]);
const Prudence = new RuneWord("Prudence", [
  new Attribute(EnhancedDef, 140, 170),
  new Attribute(AllRes, 25, 35)
], ["Armor"]);
const Sanctuary = new RuneWord("Sanctuary", [
  new Attribute(EnhancedDef, 130, 160),
  new Attribute(AllRes, 50, 70)
], []);
const Rain = new RuneWord("Rain", [
  new Attribute(Mana, 100, 150)
], ["Armor"]);
const Venom = new RuneWord("Venom", [
], []);
const Oath = new RuneWord("Oath", [
  new Attribute(EnhancedDmg, 210, 340),
  new Attribute(MagicAbsorb, 10, 15)
], ["Sword", "Axe", "Mace"]);
const Delirium = new RuneWord("Delirium", [
], ["Helm"]);
const Kingslayer = new RuneWord("Kingslayer", [
  new Attribute(EnhancedDmg, 230, 270)
], ["Sword", "Axe"]);
const Principle = new RuneWord("Principle", [
  new Attribute(Life, 100, 150)
], ["Armor"]);
const Rift = new RuneWord("Rift", [
  new Attribute(MagicDmg, 160, 250),
  new Attribute(AllAttributes, 5, 10)
], ["Polearm", "Scepter"]);
const Silence = new RuneWord("Silence", [
], []);
const Death = new RuneWord("Death", [
  new Attribute(EnhancedDmg, 300, 385)
], ["Sword", "Axe"]);
const HeartOfTheOak = new RuneWord("Heart of the Oak", [
  new Attribute(AllRes, 30, 40)
], ["Maces", "Stave"]);
const FlickeringFlame = new RuneWord("Flickering Flame", [
  new BasicAttribute(EnhancedDef, 30),
  new SkillAttribute(empty, "Resist Fire Aura", 4, 8),
  new Attribute(EnemyFireResist, 10, 15),
  new Attribute(Mana, 50, 75)
], ["Helm"]);
const Chaos = new RuneWord("Chaos", [
  new BasicAttribute(EnhancedDef, 75),
  new Attribute(EnhancedDmg, 290, 340),
  new Attribute(MagicDmg, 216, 471)
], ["Katar"]);
const CallToArms = new RuneWord("CallToArms", [
  new Attribute(EnhancedDmg, 250, 290),
  new SkillAttribute(empty, "Battle Command", 2, 6),
  new SkillAttribute(empty, "Battle Orders", 1, 6),
  new SkillAttribute(empty, "Battle Cry", 1, 4),
], []);
const Exile = new RuneWord("Exile", [
  new SkillAttribute(empty, "Defiance", 13, 16),
  new Attribute(EnhancedDef, 220, 260),
], ["Paladin Shield"]);
const Fortitude = new RuneWord("Fortitude", [
  new BasicAttribute(Def, 14),
  new Attribute(AllRes, 25, 30),
], []);
const Grief = new RuneWord("Grief", [
  new Attribute(IAS, 30, 40),
  new Attribute(Damage, 340, 400),
  new Attribute(EnemyPsnResist, 20, 25),
  new Attribute(LifeOnKill, 10, 15),
], ["Axe", "Sword"]);
const Bramble = new RuneWord("Bramble", [
  new SkillAttribute(empty, "Thorns Aura", 15, 21),
  new Attribute(PsnDmg, 25, 50),
  new BasicAttribute(Def, 300)
], ["Armor"]);
const Wind = new RuneWord("Wind", [
  new Attribute(EnhancedDmg, 120, 160)
], []);
const Dragon = new RuneWord("Dragon", [
  new Attribute(AllAttributes, 3, 5),
  new BasicAttribute(Def, 360)
], []);
const Infinity = new RuneWord("Infinity", [
  new Attribute(EnhancedDmg, 255, 325),
  new Attribute(EnemyLightResist, 45, 55)
], ["Polearm", "Spear"]);
const ChainsOfHonor = new RuneWord("Chains of Honor", [
  new BasicAttribute(EnhancedDef, 70)
], ["Armor"]);
const Eternity = new RuneWord("Eternity", [
  new Attribute(EnhancedDmg, 260, 310)
], []);
const Wrath = new RuneWord("Wrath", [
  new Attribute(DmgUndead, 250, 300),
], []);
const Beast = new RuneWord("Beast", [
  new Attribute(EnhancedDmg, 240, 270),
  new Attribute(Str, 25, 40)
], ["Axe", "Scepter", "Hammer"]);
const Enigma = new RuneWord("Enigma", [
  new Attribute(Def, 750, 775)
], ["Armor"]);
const LastWish = new RuneWord("LastWish", [
  new Attribute(EnhancedDmg, 330, 375),
  new Attribute(CrushingBlow, 60, 70)
], ["Sword", "Hammer", "Axe"]);
const Brand = new RuneWord("Brand", [
  new Attribute(EnhancedDmg, 260, 340),
  new Attribute(DmgDemon, 280, 330)
], []);
const Ice = new RuneWord("Ice", [
  new Attribute(EnhancedDmg, 140, 210),
  new Attribute(ColdDmgPerc, 25, 30)
], []);
const Destruction = new RuneWord("Destruction", [
  new Attribute(MagicDmg, 100, 180)
], ["Sword", "Polearm"]);
const Phoenix = new RuneWord("Phoenix", [
  new SkillAttribute(empty, "Redemption Aura", 10, 15),
  new Attribute(EnhancedDmg, 350, 400),
  new Attribute(DefVsMisl, 350, 400),
  new Attribute(FireAbsorbPerc, 15, 21)
], []);
const Dream = new RuneWord("Dream", [
  new Attribute(FHR, 20, 30),
  new Attribute(Def, 150, 220),
  new Attribute(AllRes, 5, 20),
  new Attribute(MagicFind, 12, 25)
], []);
const Faith = new RuneWord("Faith", [
  new SkillAttribute(empty, "Fanaticism Aura", 12, 15),
  new Attribute(Skills, 1, 2),
  new Attribute(DefVsMisl, 350, 400),
  new Attribute(FireAbsorbPerc, 15, 21)
], []);
const Famine = new RuneWord("Famine", [
  new Attribute(EnhancedDmg, 320, 370)
], ["Axe", "Hammer"]);
const Fury = new RuneWord("Fury", [
], []);
const Mist = new RuneWord("Faith", [
  new SkillAttribute(empty, "Concentration Aura", 8, 12),
  new Attribute(EnhancedDmg, 325, 375)
], []);
const Plague = new RuneWord("Plague", [
  new SkillAttribute(empty, "Cleansing  Aura", 13, 17),
  new Attribute(Skills, 1, 2),
  new Attribute(EnhancedDmg, 220, 320)
], ["Sword", "Katar", "Dagger"]);
const Doom = new RuneWord("Doom", [
  new Attribute(EnhancedDmg, 330, 370),
  new Attribute(EnemyColdResist, 40, 60)
], ["Axe", "Polearm", "Hammer"]);
const Pride = new RuneWord("Pride", [
  new SkillAttribute(empty, "Concentration   Aura", 16, 20),
  new Attribute(ArPerc, 260, 300)
], ["Polearm", "Spear"]);
const HandOfJustice = new RuneWord("Hand of Justice", [
  new Attribute(EnhancedDmg, 280, 330)
], []);
const Obsession = new RuneWord("Obsession", [
  new Attribute(MaxLifePerc, 15, 25),
  new Attribute(ManaRegen, 15, 30),
  new Attribute(AllRes, 60, 70)
], ["Stave"]);
const BreathOfTheDying = new RuneWord("BreathOfTheDying", [
  new Attribute(EnhancedDmg, 350, 400),
  new Attribute(LifeSteal, 12, 15)
], []);

