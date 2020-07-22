const fs = require('fs');

module.exports = {
    "connection": {
        'user': 'doadmin',
        'password': 'xaikjabounn01k3i',
        'host': 'saidb-do-user-6679940-0.db.ondigitalocean.com',
        'port': 25060,
        'database': 'saidb',
        'dialect': 'mysql',
        'logging': true,
        'force': false,
        'timezone': '+00:00',
        'pool': {
            max: 100,
            min: 0,
            idle: 200000,
            acquire: 1000000,
        },
        'ssl': true,
        'dialectOptions': {
            ssl: {
                ssl: true,
                cert: fs.readFileSync('app/config/ca-certificate.crt')
            }
        },
    },
    /*'connection': {
        'host': 'localhost',
        'user': 'root',
        'port' : 3306,
        'database': 'sai_test',
        'password': 'E5i5wks15',
        'multipleStatements': true
    },*/

    //Database
    'database': 'saidb',
    /*'creoDatabase': 'creoDB',
    'database2': 'quotePricing',
    'masterDatabase': 'saidb',*/

    //Pre-loaded Static Tables (Shared b/w apps)
    'permissions_table': 'userPermissions',
    'jobscope_codes_table': 'jobscopeCatCodes',
    'layout_paramTypes_table':'layoutParamTypes',
    'layout_paramType_restrictions': 'layoutParamRestrictions',
    'secType_table':'sectionType',
    'brkType_table': 'brkType',
    'brkAcc_options_table': 'brkAccOptions',
    'control_assemblies_table': 'controlAsmSum',
    'control_items_table': 'controlItemSum',

    //Standard Design Tables (Shared b/w apps)
    'panelboard_amp_type': 'panelboardAmpType',
    'base_panel_copper_3W': 'basePanelCopper3W',
    'base_panel_copper_4W': 'basePanelCopper4W',
    'add_Copper_Per_Panel_3WType': 'addCopperPerPanel3WType',
    'add_Copper_Per_Panel_4WType': 'addCopperPerPanel4WType',
    'quote_system_type': 'quoteSystemType',
    'panelboard_width_3W': 'panelboardWidth3W',
    'panelboard_width_4W': 'panelboardWidth4W',

    //Creo Tables
    'baseFrame_table': 'baseFrames',
    'cornerPost_table': 'cornerPosts',
    'brkCompartment_NW_table': 'brkCompartments_NW',
    'brk_NW_table': 'iccbNW',
    'brk_Emax2_table': 'iccbEmax2',
    'brk_powerpact_table': 'mccbPowerpact',
    'brk_tmax_table': 'mccbTmax',
    'brk_lugLanding_table': 'brkLugLandings',
    'oneLineParts_table': 'oneLineParts',
    'standardPanel_table': 'standardPanels',
    'panel_enclosureRules_table':'panelEnclosureRules',
    'filler_rails_table': 'fillerRails',
    'panel_fillers_table': 'panelFillers',
    'panelSupport_rails_table':'panelSupportRails',

    //User Login and Profile Tables
    'users_table':'users',
    'user_profile_table': 'userProfile',

    //Apps Eng Quote Tables
    'quote_summary_table':'quoteSum',
    'quote_rev_table': 'quoteRevSum',
    'quote_layout_table':'quoteLayoutSum',
    'quote_parts_labor_table':'quotePartsLaborSum',
    'quote_field_service_table':'quoteFieldServiceSum',
    'quote_freight_table':'quoteFreightSum',
    'quote_warranty_table':'quoteWarrantySum',
    'quote_section_table': 'quoteSectionSum',
    'quote_breaker_table': 'quoteBrkSum',
    'quote_brkAcc_table': 'quoteBrkAccSum',
    'quote_item_table': 'quoteItemSum',
    'quote_common_items': 'quoteComItem',
    'quote_user_items': 'quoteUserItem',
    'quote_control_sum': 'quoteControlSum',
    'panelboard_sum': 'panelboardSum',

    //Quote Pricing DB Tables
    'quotePricing_matCost': 'matCost',
    'quotePricing_density': 'density',
    'quotePricing_nemaTypes': 'nemaTypes',
    'quotePricing_trolleyTrack': 'trolleyTrackPricing',
    'quotePricing_mimicBus': 'mimicBusPricing',
    'quotePricing_fanHoods': 'fanHoodsPricing',
    'quotePricing_rearBarrier': 'rearBarrierPricing',
    'quotePricing_controlCub': 'controlCubPricing',
    'quotePricing_seismic': 'seismicPricing',
    'quotePricing_iccbComp': 'iccbCompPricing',
    'quotePricing_mccbComp': 'mccbCompPricing',
    'quotePricing_panel': 'panelPricing',
    'quotePricing_tvss': 'tvssPricing',
    'quotePricing_ct': 'ctPricing',
    'quotePricing_pt': 'ptPricing',
    'quotePricing_section': 'sectionPricing',
    'quotePricing_access': 'accessPricing',
    'quotePricing_copperTypes': 'copperPricing',
    'quotePricing_bracingTypes': 'bracingPricing',
    'quotePricing_secBusType': 'secBusPricing',
    'quotePricing_laborRates': 'laborRates',

    //Mechanical Eng MBOM Tables
    'MBOM_summary_table': 'mbomSum',
    'MBOM_breaker_table': 'mbomBrkSum',
    'MBOM_brkAcc_table': 'mbomBrkAccSum',
    'MBOM_item_table': 'mbomItemSum',
    'MBOM_common_items': 'mbomComItem',
    'MBOM_user_items': 'mbomUserItem',
    'MBOM_section_sum': 'mbomSectionSum',
    'MBOM_new_section_sum' : 'mbomNewSectionSum',

    //Mechanical Eng Submittal Tables
    'submittal_summary_table': 'submittalSum',
    'submittal_rev_table': 'submittalRevSum',
    'submittal_layout_table': 'submittalLayoutSum',
    'submittal_layout_dropdowns': 'layoutDropdownSum',
    'submittal_sections_table': 'submittalSectionSum',
    'submittal_panels_table': 'submittalPanelSum',
    'submittal_panel_breakers': 'submittalPanelBrkSum',
    'submittal_secType_table': 'sectionTypes',
    'submittal_breaker_table': 'submittalBrkSum',
    'submittal_brkAcc_table': 'submittalBrkAccSum',
    'submittal_brkAcc_options': 'submittalBrkAccOptions'
};
