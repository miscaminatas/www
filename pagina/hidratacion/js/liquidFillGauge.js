/*!
 * @license Open source under BSD 2-clause (http://choosealicense.com/licenses/bsd-2-clause/)
 * Copyright (c) 2015, Curtis Bratton
 * All rights reserved.
 */
function liquidFillGaugeDefaultSettings(){
    return {
        minValue: 0, // The gauge minimum value.
        maxValue: 100, // The gauge maximum value.
        circleThickness: 0.05, // The outer circle thickness as a percentage of it's radius.
        circleFillGap: 0.05, // The size of the gap between the outer circle and wave circle as a percentage of the outer circles radius.
        circleColor: "#178BCA", // The color of the outer circle.
        waveHeight: 0.05, // The wave height as a percentage of the radius of the wave circle.
        waveCount: 1, // The number of full waves per width of the wave circle.
        waveRiseTime: 1000, // The amount of time in milliseconds for the wave to rise from 0 to it's final height.
        waveAnimateTime: 18000, // The amount of time in milliseconds for a full wave to enter the wave circle.
        waveRise: true, // Control if the wave should rise from 0 to it's full height, or start at it's full height.
        waveHeightScaling: true, // Controls wave size scaling at low and high fill percentages. When true, wave height reaches it's maximum at 50% fill, and minimum at 0% and 100% fill. This helps to prevent the wave from making the wave circle from appear totally full or empty when near it's minimum or maximum fill.
        waveAnimate: true, // Controls if the wave scrolls or is static.
        waveColor: "#178BCA", // The color of the fill wave.
        waveOffset: 0, // The amount to initially offset the wave. 0 = no offset. 1 = offset of one full wave.
        textVertPosition: 1, // The height at which to display the percentage text withing the wave circle. 0 = bottom, 1 = top.
        textSize: 0, // The relative height of the text to display in the wave circle. 1 = 50%
        valueCountUp: true, // If true, the displayed value counts up from 0 to it's final value upon loading. If false, the final value is displayed.
        displayPercent: false, // If true, a % symbol is displayed after the value.
        textColor: "#045681", // The color of the value text when the wave does not overlap it.
        waveTextColor: "#A4DBf8" // The color of the value text when the wave overlaps it.
    };
}

function loadLiquidFillGauge(elementId, value, config) {
    if(config == null) config = liquidFillGaugeDefaultSettings();

    var gauge = d3.select("#" + elementId);
    var radius = Math.min(parseInt(gauge.style("width")), parseInt(gauge.style("height")))/2;
    var locationX = parseInt(gauge.style("width"))/2 - radius;
    var locationY = parseInt(gauge.style("height"))/2 - radius;
    var fillPercent = Math.max(config.minValue, Math.min(config.maxValue, value))/config.maxValue;

    var waveHeightScale;
    if(config.waveHeightScaling){
        waveHeightScale = d3.scale.linear()
            .range([0,config.waveHeight,0])
            .domain([0,50,100]);
    } else {
        waveHeightScale = d3.scale.linear()
            .range([config.waveHeight,config.waveHeight])
            .domain([0,100]);
    }

    var textPixels = (config.textSize*radius/2);
    var textFinalValue = parseFloat(value).toFixed(2);
    var textStartValue = config.valueCountUp?config.minValue:textFinalValue;
    var percentText = config.displayPercent?"%":"";
    var circleThickness = config.circleThickness * radius;
    var circleFillGap = config.circleFillGap * radius;
    var fillCircleMargin = circleThickness + circleFillGap;
    var fillCircleRadius = radius - fillCircleMargin;
    var waveHeight = fillCircleRadius*waveHeightScale(fillPercent*100);

    var waveLength = fillCircleRadius*2/config.waveCount;
    var waveClipCount = 1+config.waveCount;
    var waveClipWidth = waveLength*waveClipCount;

    // Rounding functions so that the correct number of decimal places is always displayed as the value counts up.
    var textRounder = function(value){ return Math.round(value); };
    if(parseFloat(textFinalValue) != parseFloat(textRounder(textFinalValue))){
        textRounder = function(value){ return parseFloat(value).toFixed(1); };
    }
    if(parseFloat(textFinalValue) != parseFloat(textRounder(textFinalValue))){
        textRounder = function(value){ return parseFloat(value).toFixed(2); };
    }

    // Data for building the clip wave area.
    var data = [];
    for(var i = 0; i <= 40*waveClipCount; i++){
        data.push({x: i/(40*waveClipCount), y: (i/(40))});
    }

    // Scales for drawing the outer circle.
    var gaugeCircleX = d3.scale.linear().range([0,2*Math.PI]).domain([0,1]);
    var gaugeCircleY = d3.scale.linear().range([0,radius]).domain([0,radius]);

    // Scales for controlling the size of the clipping path.
    var waveScaleX = d3.scale.linear().range([0,waveClipWidth]).domain([0,1]);
    var waveScaleY = d3.scale.linear().range([0,waveHeight]).domain([0,1]);

    // Scales for controlling the position of the clipping path.
    var waveRiseScale = d3.scale.linear()
        // The clipping area size is the height of the fill circle + the wave height, so we position the clip wave
        // such that the it will won't overlap the fill circle at all when at 0%, and will totally cover the fill
        // circle at 100%.
        .range([(fillCircleMargin+fillCircleRadius*2+waveHeight),(fillCircleMargin-waveHeight)])
        .domain([0,1]);
    var waveAnimateScale = d3.scale.linear()
        .range([0, waveClipWidth-fillCircleRadius*2]) // Push the clip area one full wave then snap back.
        .domain([0,1]);

    // Scale for controlling the position of the text within the gauge.
    var textRiseScaleY = d3.scale.linear()
        .range([fillCircleMargin+fillCircleRadius*2,(fillCircleMargin+textPixels*0.7)])
        .domain([0,1]);

    // Center the gauge within the parent SVG.
    var gaugeGroup = gauge.append("g")
        .attr('transform','translate('+locationX+','+locationY+')');


    // Text where the wave does not overlap.
    var text1 = gaugeGroup.append("text")
        .text(textRounder(textStartValue) + percentText)
        .attr("class", "liquidFillGaugeText")
        .attr("text-anchor", "middle")
        .attr("font-size", textPixels + "px")
        .style("fill", config.textColor)
        .style("position", "ab")
        .attr('transform','translate('+radius+','+textRiseScaleY(config.textVertPosition)+')');

    // The clipping wave area.
    var clipArea = d3.svg.area()
        .x(function(d) { return waveScaleX(d.x); } )
        .y0(function(d) { return waveScaleY(Math.sin(Math.PI*2*config.waveOffset*-1 + Math.PI*2*(1-config.waveCount) + d.y*2*Math.PI));} )
        .y1(function(d) { return (fillCircleRadius*2 + waveHeight); } );
    var waveGroup = gaugeGroup.append("defs")
        .append("clipPath")
        .attr("id", "clipWave" + elementId);
    var wave = waveGroup.append("path")
        .datum(data)
        .attr("d", clipArea);

    // The inner circle with the clipping wave attached.
    var fillCircleGroup = gaugeGroup.append("g")
        .attr("clip-path", "url(#clipWave" + elementId + ")");
    fillCircleGroup.append("path")
        .attr("d", "M76 330.4c-4.9-0.5-9.9-0.8-14.7-1.6c-1.2-0.2-2.5-0.4-3.7-1c-0.3-0.1-1.1-0.5-1.1-1 c0-1.8 0-3.6 0-5.4c0-10.2 0-20.3 0-30.5c0-13 0-26 0-38.9c0-8.7 0-17.4 0-26c0-0.7 0-1.3 0-2c0 0 0-0.1 0-0.1c0-0.1 1.8-1.1 2-1.3 c1.7-1.3 2.9-3.1 3.5-5.1c0.5-1.8 0.5-3.6 0.5-5.5c0-2 0-3.9 0-5.9c0.1-16.4 0.2-32.7 0.2-49.1c0-8.7 0.1-17.5 0.1-26.2 c1.1 9.8 2.2 19.6 3.3 29.3c0.4 3.6 0.8 7.2 1.2 10.7c0.1 0.7 0 1.5 0 2.2c0 2.1 0 4.2 0 6.3c0 11.9 0.1 23.8 0.1 35.7 c0 1.3 0 2.6 0 3.9c0 0.2 0 0.4 0 0.6c0 0.1-0.9 0.7-1 0.8c-0.6 0.2-1.1 0.4-1.6 0.7c-0.5 0.4-1 0.8-1.4 1.3c-1 1-2.2 2-2.6 3.4 c-0.4 1.2-0.2 2.7-0.2 4c0 0.5-0.1 1 0.2 1.5c0.5 0.9 1.6 1.1 2.5 0.8c1.1-0.3 0.7-2.3 0.7-3.1c0.2 0 0.7-0.1 0.7 0.1 c0 0.4 0 0.8 0 1.3c0-0.1 0-0.2 0-0.3c0 2 0 4 0 6c0 1.7-0.7 5.6 1.7 5.9c1.2 0.1 2.3-0.3 2.3-1.6c0-1 0-2.1 0-3.1 c0-2.1 0-4.2 0-6.3c0.8-0.1 0.5 1 0.5 1.6c0 1.5 0 3 0 4.5c0 1.4 0 2.8 0 4.1c0 1-0.1 2.3 1.1 2.7c2.9 1 2.2-4.5 2.2-5.9 c0-2.4 0-4.7 0-7c0.3 0 0.6-0.1 0.6 0.2c0 0.4 0 0.8 0 1.2c0 1.4 0 2.8 0 4.2c0 1.3 0 2.6 0 3.9c0 1 0 2 1.4 2.2 c0.3 0 0.4-0.1 0.8-0.2c0.4 0 0.9-0.2 1-0.6c0.1-0.3 0.1-0.6 0.1-0.9c0-1.2 0-2.3 0-3.5c0-2.2 0-4.3 0-6.5c0.5-0.2 0.4 0.2 0.4 0.5 c0 0.7 0 1.3 0 2c0 1.5 0 3 0 4.5c0 0.3 0 0.7 0 1c0.1 0.5 0.3 0.9 0.8 1.1c0.2 0.1 0.4 0.2 0.7 0.2c0.2 0 0.3 0 0.5 0 c0-0.1 0-0.1 0-0.2c1.5 0 1.4-1.9 1.4-3c0-2.5 0-5 0-7.5c0-2.5 0.4-5.6-0.6-8c-0.4-0.9-1.1-1.8-2-2.3c-0.2-0.1-1.2-0.5-1.2-0.6 c0-0.3 0-0.7 0-1c0-1.7 0-3.5 0-5.2c0-6 0-12 0-17.9c0-6 0-12.1 0-18.1c0-1.8 0-3.6 0-5.5c0-0.9-0.1-1.6-0.2-2.5 c-1-8.6-1.9-17.2-2.9-25.8c-1.2-11.3-2.5-22.5-3.7-33.8c-0.1-1.1-0.2-2.1-0.4-3.2c-0.4-3.5-5.2-3.7-7.5-1.9 c-2.3-4.5-6.8-7.8-11.4-9.7c-1.1-0.5-2.3-0.9-3.5-1.2c-0.7-0.2-0.6-0.2-0.6-0.8c0-1.5 0-2.9 0-4.4c0-1.1 0-2.2 0-3.2 c0-0.1 2.3-1 2.5-1.2c1-0.6 2-1.2 2.9-2c3.6-3 5.8-7.4 6.2-12c0.1-1.5 0.1-3.1 0.1-4.6c4.4 0.3 8.6-2.7 9.6-7 c1.1-4.5-1.5-9.2-5.8-10.8c2.9-1.1 5.2-3.6 5.9-6.7c0.4-1.7 0.2-3.6-0.4-5.3c-0.2-0.4-0.6-0.8-0.2-1c0.4-0.3 0.8-0.6 1.2-0.9 c0.7-0.6 1.2-1.3 1.7-2.1c1.7-2.8 1.8-6.5 0-9.3c-1.8-2.8-5.2-4.2-8.4-3.2c1.6-4.2-0.4-8.8-4.9-9.9c-2.2-0.6-4.5-0.4-6.7-0.4 c-0.2 0-0.3-1.1-0.3-1.3c-0.7-2.6-2.5-4.8-5-5.8C41-0.6 36.4-0.2 33.6 2.6c-1.1 1.1-2 2.6-2.4 4.1C31 7 30.9 7.4 30.9 7.8 c0 0.2-2.2 0.1-2.5 0.1c-2.8 0-5.7 0.2-7.8 2.3c-2.1 2.1-2.4 5.4-1.4 8.1c-3.1-1-6.4 0.2-8.2 2.9c-2 2.8-1.9 6.6-0.2 9.5 c0.4 0.7 0.9 1.3 1.5 1.9c0.3 0.3 0.6 0.5 0.9 0.8c0.2 0.1 0.3 0.2 0.5 0.3c0.4 0.2 0.1 0.4 0 0.7c-0.7 1.7-0.9 3.5-0.6 5.3 c0.6 3.2 2.9 5.9 5.9 7c-4.4 1.6-6.9 6.3-5.8 10.8c1 4.3 5.1 7.3 9.6 7c0 3.6 0 7 1.5 10.4c1.9 4.2 5.4 7.6 9.8 9.2 c0.6 0.2 1.1 0.1 1.1 0.8c0 0.6 0 1.2 0 1.9c0 1.5 0 3 0 4.6c0 0.3 0 0.6 0 1c0 0-3.2 0.8-3.4 0.9c-2.4 0.8-4.7 1.9-6.8 3.3 c-2.8 1.9-5.3 4.3-6.8 7.4c-2.1-2-7.3-2-7.7 1.7c-0.1 0.9-0.2 1.8-0.3 2.7c-0.5 4.6-1 9.3-1.5 13.9c-1.4 12.3-2.7 24.7-4.1 37 c-0.3 3.1-0.7 6.1-1 9.2c-0.1 0.8-0.2 1.5-0.2 2.2c0 1.7 0 3.3 0 5c0 12 0 24 0 36c0 1.9 0 3.9 0 5.8c0 0.5 0 1 0 1.5 c0 0.1 0 0.2 0 0.3c0 0.1-1.4 1.2-1.6 1.4c-1.9 2.4-1.3 6.1-1.3 9c0 2.4 0 4.8 0 7.1c0 0.9-0.3 2.6 0.7 3.2c0.7 0.4 2.1 0.2 2.5-0.5 c0.2-0.4 0.2-0.9 0.2-1.3c0-1.5 0-3 0-4.4c0-0.7 0-1.4 0-2.1c0-0.3-0.1-0.8 0.4-0.6c0 2.2 0 4.4 0 6.6c0 1.1 0 2.3 0 3.4 c0 0.3 0 0.6 0.1 0.9c0.2 0.4 0.6 0.7 1 0.8c0.5 0.1 0.6-0.1 1.1-0.1c1.2-0.1 1.1-1.1 1.1-2c0-1.3 0-2.6 0-3.9c0-1.4 0-2.8 0-4.1 c0-0.4 0-0.8 0-1.1c0-0.4 0.2-0.2 0.5-0.2c0 2.3 0 4.6 0 6.9c0 1.3 0 2.5 0 3.8c0 1.2 0.4 2.6 1.9 2.3c1.3-0.2 1.4-1.5 1.4-2.5 c0-1.4 0-2.8 0-4.2c0-1.5 0-3 0-4.6c0-0.6-0.3-1.8 0.5-1.7c0 2.1 0 4.2 0 6.4c0 1 0 2 0 3c0 0.5 0.1 0.9 0.4 1.3 c0.7 0.7 1.4 0.5 2.1 0.3c2.2-0.6 1.5-4.5 1.5-6.1c0-2 0-4.1 0-6.1c0 0.2 0 0.5 0 0.7c0-0.4 0-0.8 0-1.2c0-0.4 0.3-0.3 0.7-0.3 c0 1.2-0.4 3.2 1.1 3.5c0.8 0.2 1.9-0.5 2.2-1.3c0.2-0.6 0.1-1.3 0.1-1.8c0-1.7 0.2-3.5-0.9-4.9c-0.7-1-1.8-1.8-2.6-2.7 c-0.8-0.8-1.9-1.1-2.8-1.8c-0.2-0.2-1.4-0.7-1.4-0.9c0-0.4 0-0.7 0-1.1c0-1.8 0-3.6 0-5.3c0-12 0-23.9 0-35.9c0-2.1-0.2-4.2 0.1-6.3 c0.5-4.3 1-8.6 1.4-12.9c1.1-10 2.2-20.1 3.3-30.1c0 0 0 0 0-0.1c0 17 0 34-0.1 51.1c0 11.9-0.1 23.8-0.2 35.7c0 2 0.1 4 1 5.9 c0.9 1.9 2.4 3.4 4.2 4.4c0.4 0.2 1.8 0.6 1.8 1.1c0 2.2 0 4.3 0 6.5c0 10.8 0 21.5 0 32.3c0 12.8 0 25.5 0 38.3 c0 6.9 0 13.7 0 20.6c0 4.1 0 8.3 0 12.4c0 0.8 0 1.6 0 2.4c0 0.1 0.7 0.1 0.8 0.1c2.3 0 4.7 0 7 0c8.7 0 17.4 0 26.1 0 c5.8 0 11.5 0 17.3 0c2 0 4 0 6 0c0.9 0 0-3.7-0.2-4.2C79.7 331.7 78.1 330.6 76 330.4C63.9 329.2 81.9 330.9 76 330.4z M48.5 323.1 c0 2.2 0 4.4 0 6.6c-4.5-0.4-9.2-0.5-13.7-1.5c-0.8-0.2-3.3-0.6-3.3-1.6c0-2.3 0-4.6 0-6.9c0-10.8 0-21.6 0-32.4 c0-12.8 0-25.6 0-38.4c0-7.2 0-14.4 0-21.7c0-0.1 0-0.3 0-0.4c3 0.2 6 0.3 8.9 0.3c2.7 0 5.5 0 8.1-0.7c0 6 0 12 0 18 c0 12.6 0 25.2 0 37.8c0 11.1 0 22.1 0 33.2C48.5 318 48.5 320.6 48.5 323.1z")
    .attr("with","80.7px")
        .style("fill", config.waveColor);

    // Text where the wave does overlap.
    var text2 = fillCircleGroup.append("text")
        .text(textRounder(textStartValue) + percentText)
        .attr("class", "liquidFillGaugeText")
        .attr("text-anchor", "middle")
        .attr("font-size", textPixels + "px")
        .style("fill", config.waveTextColor)
        .attr('transform','translate('+radius+','+textRiseScaleY(config.textVertPosition)+')');

    // Make the value count up.
    if(config.valueCountUp){
        var textTween = function(){
            var i = d3.interpolate(this.textContent, textFinalValue);
            return function(t) { this.textContent = textRounder(i(t)) + percentText; }
        };
        text1.transition()
            .duration(config.waveRiseTime)
            .tween("text", textTween);
        text2.transition()
            .duration(config.waveRiseTime)
            .tween("text", textTween);
    }

    // Make the wave rise. wave and waveGroup are separate so that horizontal and vertical movement can be controlled independently.
    var waveGroupXPosition = fillCircleMargin+fillCircleRadius-waveClipWidth;
    if(config.waveRise){
        waveGroup.attr('transform','translate('+waveGroupXPosition+','+waveRiseScale(0)+')')
            .transition()
            .duration(config.waveRiseTime)
            .attr('transform','translate('+waveGroupXPosition+','+waveRiseScale(fillPercent)+')')
            .each("start", function(){ wave.attr('transform','translate(1,0)'); }); // This transform is necessary to get the clip wave positioned correctly when waveRise=true and waveAnimate=false. The wave will not position correctly without this, but it's not clear why this is actually necessary.
    } else {
        waveGroup.attr('transform','translate('+waveGroupXPosition+','+waveRiseScale(fillPercent)+')');
    }

    if(config.waveAnimate) animateWave();

    function animateWave() {
        wave.transition()
            .duration(config.waveAnimateTime)
            .ease("linear")
            .attr('transform','translate('+waveAnimateScale(1)+',0)')
            .each("end", function(){
                wave.attr('transform','translate('+waveAnimateScale(0)+',0)');
                animateWave(config.waveAnimateTime);
            });
    }
}