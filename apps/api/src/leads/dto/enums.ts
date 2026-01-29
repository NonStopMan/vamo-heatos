export enum Salutation {
  Frau = 'Frau',
  Mann = 'Mann',
  Divers = 'Divers',
}

export enum ImmoType {
  EinfamilienhausZweifamilienhaus = 'Einfamilienhaus / Zweifamilienhaus',
  DoppelhausReihenhaus = 'Doppelhaus / Reihenhaus',
  Wohnung = 'Wohnung',
  Gewerbe = 'Gewerbe',
  Mehrfamilienhaus = 'Mehrfamilienhaus',
  Sonstiges = 'Sonstiges',
}

export enum YesNo {
  Ja = 'Ja',
  Nein = 'Nein',
}

export enum BoilerRoomSize {
  WenigerAls4qm = 'weniger als 4qm',
  MehrAls4qm = 'mehr als 4 qm',
}

export enum InstallationLocationCeilingHeight {
  NiedrigerAls180 = 'niedriger als 180 cm',
  Range180to199 = '180 - 199 cm',
  HoeherAls199 = 'h\u00f6her als 199 cm',
}

export enum RoomsBetweenHeatingRoomAndOutdoorUnit {
  NoRoom = 'no_room',
  OneRoom = 'one_room',
  TwoRoomsOrMore = 'two_rooms_or_more',
}

export enum BuildingLevelLocation {
  Keller = 'Keller',
  Ergeschoss = 'Ergeschoss',
  Obergeschoss = 'Obergeschoss',
  Dachgeschoss = 'Dachgeschoss',
}

export enum GroundingType {
  WaterOrGasPipe = 'water_or_gas_pipe',
  GroundingSpikeOrFoundation = 'grounding_spike_or_foundation',
  NoGrounding = 'no_grounding',
  Unknown = 'unknown',
}

export enum OwnershipRelationship {
  Eigentuemer = 'Eigent\u00fcmer',
  Teileigentuemer = 'Teileigent\u00fcmer',
  Sonstiges = 'Sonstiges',
}

export enum OwnershipType {
  OneOwner = 'one_owner',
  TwoOwners = 'two_owners',
  CommunityOfOwners = 'community_of_owners',
}

export enum TypeOfHeating {
  Heizkoerper = 'Heizk\u00f6rper',
  Fussbodenheizung = 'Fu\u00dfbodenheizung',
  HeizkoerperPlusFussbodenheizung = 'Heizk\u00f6rper + Fu\u00dfbodenheizung',
  Nachtspeicherofen = 'Nachtspeicherofen',
  Sonstiges = 'Sonstiges',
}

export enum LocationHeating {
  UntermDach = 'Unterm Dach',
  ImKeller = 'Im Keller',
  ImEG = 'Im EG',
  ErsteOG = '1.OG',
  Dachgeschoss = 'Dachgeschoss',
  Obergeschoss = 'Obergeschoss',
  Keller = 'Keller',
  Erdgeschoss = 'Erdgeschoss',
}

export enum ApartmentHeatingSystem {
  Yes = 'Yes',
  No = 'No',
}

export enum ShowerType {
  Duschkopf = 'Duschkopf',
  RaindanceDuschkopf = 'Raindance Duschkopf',
  WasserfallDusche = 'Wasserfall-Dusche',
}

export enum ConsumptionUnit {
  Liter = 'Liter (l)',
  Kilowattstunden = 'Kilowattstunden (kWh)',
}

export enum HeatingSystemType {
  Fernwaerme = 'Fernw\u00e4rme',
  Gasetagenheizung = 'Gasetagenheizung',
  Kohle = 'Kohle',
  Heizoel = 'Heiz\u00f6l',
  Waermepumpe = 'W\u00e4rmepumpe',
  Erdgas = 'Erdgas',
  Fluessiggas = 'Fl\u00fcssiggas',
  PelletHolzheizung = 'Pellet-/Holzheizung',
  Sonstiges = 'Sonstiges',
}

export enum DomesticHotWaterCirculationPump {
  No = 'no',
  Unknown = 'unknown',
  YesButInactive = 'yes_but_inactive',
  YesAndActive = 'yes_and_active',
}

export enum DomesticWaterStation {
  No = 'no',
  Unknown = 'unknown',
  Yes = 'yes',
  WaterFilterAndPressureReducer = 'water_filter_and_pressure_reducer',
}

export enum ProjectTimeline {
  Sofort = 'Sofort',
  OneToThreeMonths = '1-3 Monate',
  ThreeToSixMonths = '3-6 Monate',
  MoreThanSixMonths = '>6 Monate',
}

export enum HouseholdIncome {
  MoreThan40kGross = 'more_than_40k_gross',
  LessThan40kGross = 'less_than_40k_gross',
  NoAnswer = 'no_answer',
}

export enum StatusOfFoundationConstruction {
  Vamo = 'Vamo',
  Kunde = 'Kunde',
  KeinFundamentNotwendig = 'Kein Fundament notwendig',
}

export enum AdditionalDisposalItem {
  OilTankPlasticUpTo5000l = 'oil_tank_plastic_up_to_5000l',
  OilTankPlasticMoreThan5000l = 'oil_tank_plastic_more_than_5000l',
  OilTankSteelUpTo5000l = 'oil_tank_steel_up_to_5000l',
  OilTankSteelMoreThan5000l = 'oil_tank_steel_more_than_5000l',
  Heatpump = 'heatpump',
  LiquidGasTank = 'liquid_gas_tank',
}
