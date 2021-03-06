/*
 Template Name: Lexa - Responsive Bootstrap 4 Admin Dashboard
 Author: Themesbrand
 File: Range slider
 */

$(document).ready(function () {
    $("#range_01").ionRangeSlider();
    
    $("#range_02").ionRangeSlider({
        min: 100,
        max: 1000,
        from: 550
    });
    
    $("#range_03").ionRangeSlider({
        type: "double",
        grid: true,
        min: 0,
        max: 1000,
        from: 200,
        to: 800,
        prefix: "$"
    });
   
    $("#range_04").ionRangeSlider({
        type: "double",
        grid: true,
        min: -1000,
        max: 1000,
        from: -500,
        to: 500
    });
    
    $("#range_05").ionRangeSlider({
        type: "double",
        grid: true,
        min: 0,
        max: 4000,
        from: 3200,
        to: 4000,
        values: [0, 15, 30, 60, 90, 100, 150, 200, 225, 250, 300, 400, 450, 600, 800, 1000, 1200, 1600, 2000, 2500, 3000, 3200, 4000, 5000, 6000]
    });
    
    $("#range_06").ionRangeSlider({
        grid: true,
        from: 3,
        values: [0, 15, 30, 60, 90, 100, 150, 200, 225, 250, 300, 400, 450, 600, 800, 1000, 1200, 1600, 2000, 2500, 3000, 3200, 4000, 5000, 6000]
    });
    
    $("#range_07").ionRangeSlider({
        grid: true,
        min: 1000,
        max: 1000000,
        from: 200000,
        step: 1000,
        prettify_enabled: true
    });
    
    $("#range_08").ionRangeSlider({
        min: 100,
        max: 1000,
        from: 550,
        disable: true
    });
    $("#range_09").ionRangeSlider({
        grid: true,
        min: 18,
        max: 70,
        from: 30,
        prefix: "Age ",
        max_postfix: "+"
    });
    $("#range_10").ionRangeSlider({
        type: "double",
        min: 100,
        max: 200,
        from: 145,
        to: 155,
        prefix: "Weight: ",
        postfix: " million pounds",
        decorate_both: true
    });
    $("#range_11").ionRangeSlider({
        type: "single",
        grid: true,
        min: -90,
        max: 90,
        from: 0,
        postfix: "Â°"
    });
    $("#range_12").ionRangeSlider({
        type: "double",
        min: 1000,
        max: 2000,
        from: 1200,
        to: 1800,
        hide_min_max: true,
        hide_from_to: true,
        grid: true
    });
});