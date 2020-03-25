const fs = require('fs');

module.exports = {
    /*"connection": {
        'user': 'doadmin',
        'password': 'xaikjabounn01k3i',
        'host': 'saidb-do-user-6679940-0.db.ondigitalocean.com',
        'port':' 25060,
        'database': 'saidb',
        'dialect': 'mysql',
        'logging': false,
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
                cert: fs.readFileSync('./ca-certificate.crt')
            }
        },
    },*/
    'connection': {
        'host': 'localhost',
        'user': 'root',
        'port' : 3306,
        'password': 'E5i5wks15',
        'multipleStatements': true
    },

    //Database
    'database': 'sai_test',
    'database2': 'quotePricing',
    //Jobscope Tables
    'jobscope_codes_table': 'jobscopeCatCodes',

    //Apps Eng Quote Tables
    'quote_summary_table':'quoteSum',
    'quote_layout_table':'quoteLayoutSum',
    'quote_section_type':'quoteSectionType',
    'quote_layout_dropdown':'quoteLayoutDropdown',
    'quote_parts_labor_table':'quotePartsLaborSum',
    'quote_field_service_table':'quoteFieldServiceSum',
    'quote_freight_table':'quoteFreightSum',
    'quote_warranty_table':'quoteWarrantySum',
    'quote_section_table': 'quoteSectionSum',
    'quote_breaker_table': 'quoteBrkSum',
    'quote_brkAcc_table': 'quoteBrkAccSum',
    'quote_brkAcc_dropdown': 'quoteBrkAccDropdown',
    'quote_item_table': 'quoteItemSum',
    'quote_common_items': 'quoteComItem',
    'quote_user_items': 'quoteUserItem',
    'quote_control_sum': 'quoteControlSum',
    'panelboard_amp_type': 'panelboardAmpType',
    'base_panel_copper_3W': 'basePanelCopper3W',
    'base_panel_copper_4W': 'basePanelCopper4W',
    'add_Copper_Per_Panel_3WType': 'addCopperPerPanel3WType',
    'add_Copper_Per_Panel_4WType': 'addCopperPerPanel4WType',
    'quote_system_type': 'quoteSystemType',
    'panelboard_width_3W': 'panelboardWidth3W',
    'panelboard_width_4W': 'panelboardWidth4W',
    'panelboard_sum': 'panelboardSum',

    //Quote Pricing DB Tables
    'quotePricing_matCost': 'matCost',
    'quotePricing_density': 'density',
    'quotePricing_nemaTypes': 'nemaTypes',
    'quotePricing_trolleyTrack': 'trolleyTrackOpt',
    'quotePricing_mimicBus': 'mimicBusOpt',
    'quotePricing_fanHoods': 'fanHoodsOpt',
    'quotePricing_rearBarrier': 'rearBarrierOpt',
    'quotePricing_controlCub': 'controlCubOpt',
    'quotePricing_seismic': 'seismicOpt',
    'quotePricing_iccbComp': 'iccbCompOpt',
    'quotePricing_mccbComp': 'mccbCompOpt',
    'quotePricing_panel': 'panelOpt',
    'quotePricing_tvss': 'tvssOpt',
    'quotePricing_ct': 'ctOpt',
    'quotePricing_pt': 'ptOpt',
    'quotePricing_section': 'sectionOpt',
    'quotePricing_access': 'accessOpt',
    'quotePricing_copperTypes': 'copperTypes',
    'quotePricing_bracingTypes': 'bracingTypes',
    'quotePricing_secBusType': 'secBusType',
    'quotePricing_laborRates': 'laborRates',
    'quotePricing_test': 'test',

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
    'submittal_breaker_table': 'submittalBrkSum',
    'submittal_brkAcc_table': 'submittalBrkAccSum',
    'submittal_brkAcc_dropdown': 'submittalBrkAccDropdown',
    'submittal_item_table': 'submittalItemSum',
    'submittal_common_items': 'submittalComItem',
    'submittal_user_items': 'submittalUserItem',
    'submittal_control_sum': 'submittalControlSum',
    'control_assemblies_table': 'controlAsmSum',
    'control_items_table': 'controlItemSum',



};
