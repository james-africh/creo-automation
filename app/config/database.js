const fs = require('fs');
// config/database.js
module.exports = {
        /*user: 'doadmin',
        password: 'xaikjabounn01k3i',
        host: 'saidb-do-user-6679940-0.db.ondigitalocean.com',
        port: 25060,
        database: 'saidb',
        dialect: 'mysql',
        logging: false,
        force: false,
        timezone: '+00:00',
        pool: {
            max: 100,
            min: 0,
            idle: 200000,
            acquire: 1000000,
        },
        ssl: true,
        dialectOptions: {
            ssl: {
                ssl: true,
                cert: fs.readFileSync('./ca-certificate.crt')
            }
        },*/









        host: 'localhost',
        user: 'root',
        password: 'E5i5wks15',
        database: 'sai_test',
        port : 3306,
        multipleStatements: true,

    //Jobscope Tables
    'jobscope_codes_table': 'jobscopeCatCodes',
    //User Login and Profile Tables
    'users_table':'users',
    'user_profile_table': 'userProfile',
    'permissions_table': 'userPermissions',

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
    'quote_item_table': 'quoteItemSum',
    'quote_common_items': 'quoteComItem',
    'quote_user_items': 'quoteUserItem',
    'quote_control_assemblies': 'quoteControlAsm',
    'control_assemblies_table': 'controlAsmSum',
    'control_items_table': 'controlItemSum',

    //Misc
    'solution_log': 'solutionLog',

    //Mechanical Eng MBOM Tables
    'MBOM_summary_table': 'mbomSum',
    'MBOM_breaker_table': 'mbomBrkSum',
    'MBOM_brkAcc_table': 'mbomBrkAccSum',
    'MBOM_item_table': 'mbomItemSum',
    'MBOM_common_items': 'mbomComItem',
    'MBOM_user_items': 'mbomUserItem',
    'MBOM_section_sum': 'mbomSectionSum',

    //Issue Log Tables
    'department_table': 'department',
    'cell_table': 'cell',
    'role_table': 'role',
    'person_table': 'person',
    'codes_table': 'codes',
    'issue_table': 'issue',
    'codeToDepartment_table':'codeToDepartment',
    'comment_table': 'comment'
};
