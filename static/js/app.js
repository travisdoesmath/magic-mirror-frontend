let articles = [];
let currentArticle = 0;
let weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function updateDateTime() {
    let now = new Date()
    let dateBox = document.getElementById('date')
    let timeBox = document.getElementById('time')
    dateBox.innerText = now.toLocaleDateString('en-us', {weekday:'short', day: 'numeric', month:'long'})
    timeBox.innerText = now.toLocaleTimeString('en-us', {hour: 'numeric', minute: '2-digit'});
}

let scrollStarted = false;

function updateNews() {
    let transitionTime = 500
    let delayTime = 10000

    function scrollNews() {
        //let firstArticleWidth = document.querySelector('#news').firstChild.scrollWidth
        let articleWidth = 550
    
        d3.select('#news')
            .transition()
            .delay(delayTime)
            .duration(transitionTime)
            //.ease(d3.easeLinear)
            .style('left', `${-articleWidth}px`)
            .on('end', () => {
                let articles = document.querySelector('#news')
                articles.append(articles.firstChild)
                articles.style.left = '0px'
                scrollNews()
            })
    
    }    

    d3.json('/news').then(function(data) {
        console.log('news', data)

        let articles = d3.select('#news').selectAll('.article')
            .data(data.articles.filter(x => x.content !== "[Removed]"), d => d.url)
    
        articles.enter()
            .append('div')
            .attr('class', 'article')
            .merge(articles)
            .html(d => `<p id="news-title">${d.title}</p>`)

        articles.exit()
            .remove()
    }).then(() => {
        if (!scrollStarted) {
            scrollStarted = true
            scrollNews()
        }
    })
}


function updateWeather() {
    d3.json('/weather').then(function(data) {
        console.log(data)
        // let tempColors = [
        //     '#808',
        //     '#407',
        //     '#227',
        //     '#15a',
        //     '#07b',
        //     '#158',
        //     '#066',
        //     '#075',
        //     '#590',
        //     '#b90',
        //     '#c60',
        //     '#b30',
        //     '#a00',
        //     '#800'

        // ]

        let tempColors = [
            'hsl(300,100%,30%)', // -10 to 0
            'hsl(280,100%,50%)', // 1 to 10
            'hsl(260,100%,60%)', // 11 to 20
            'hsl(240,80%,60%)', // 21 to 30
            'hsl(210,90%,50%)', // 31 to 40
            'hsl(190,100%,40%)', // 41 to 50
            'hsl(140,80%,40%)', // 51 to 60
            'hsl(110,100%,40%)', // 61 to 70
            'hsl(80,100%,40%)', // 71 to 80
            'hsl(50,100%,40%)', // 81 to 90
            'hsl(30,100%,40%)', // 91 to 100
            'hsl(20,100%,40%)', // 101 to 110
            'hsl(10,100%,35%)', // 111 to 120
            'hsl(0,100%,30%)', // 121+
        ]


        let tempColor = d3.scaleQuantize()
        .domain([-10,110])
        .range(tempColors)

        let testColors = false;

        if (testColors) {
            let colorTest = d3.select('body').append('svg')
                .style('position', 'fixed')
                .style('top', 0)
                .style('left', 0)
                .style('height', '1000px')
                .selectAll('rect').data(tempColors)

            colorTest.enter()
                .append('rect')
                .attr('x', 0)
                .attr('y', (d, i) => `${i * 50}px`)
                .attr('width', '100px')
                .attr('height', '50px')
                .attr('fill', d => d)

            
            colorTest.enter()
                .append('text')
                .attr('x', 10)
                .attr('y', (d, i) => `${i * 50 + 40}px`)
                .style('font', 'Helvetica 35px')
                .style('fill', 'black')
                .text((d, i) => i*10-10)
            
        }

        var sunrise = new Date(data.current.sunrise*1000).toLocaleTimeString('en-us', {hour: 'numeric', minute: '2-digit'});
        var sunset = new Date(data.current.sunset*1000).toLocaleTimeString('en-us', {hour: 'numeric', minute: '2-digit'});

        d3.select('#sunrise-sunset').html(`<img src='/static/img/sunrise.png'> ${sunrise} <img src='/static/img/sunset.png'> ${sunset}`)

        var moonDiameter = 30
        phase = SunCalc.getMoonIllumination(now).phase

        var moonSvg = d3.select('#sunrise-sunset').append('svg')
            .attr('width', moonDiameter)
            .attr('height', moonDiameter)

        moonSvg.html('')

        moonSvg.append('circle')
            .attr('cx', 0.5*moonDiameter)
            .attr('cy', 0.5*moonDiameter)
            .attr('r', 0.5*moonDiameter)
            .attr('fill', '#DDD')

        moonSvg.append('path')
            .attr('d', d => `M0 ${-0.5*moonDiameter}` + 
                            `c${(2*phase % 1 - 0.5) * moonDiameter * 4/3} 0, ${(2*phase % 1 - 0.5) * moonDiameter * 4/3} ${moonDiameter}, 0 ${moonDiameter} ` +
                            `c${(phase > 0.5 ? -1 : 1) * moonDiameter * 2/3} 0, ${(phase > 0.5 ? -1 : 1) * moonDiameter * 2/3} ${-moonDiameter}, 0 ${-moonDiameter}`)
            .attr('transform', `translate(${0.5*moonDiameter},${0.5*moonDiameter})`)
            .attr('fill', '#222')

        d3.select('#current-temperature').text(`${Math.round(data.current.temp)}°`).style('color', data.current.temp < 100 ? tempColor(data.current.temp) : '#FC7')
        //d3.select('#current-feels-like').text(`feels like ${Math.round(data.current.feels_like)}°`)

        
        d3.select('#current-description').html('') 
        let currentWeatherDescription = d3.select('#current-description').append('div')
        currentWeatherDescription.append('span').text(data.current.weather[0].description)
        currentWeatherDescription.append('img').attr('src', `http://openweathermap.org/img/wn/${data.current.weather[0].icon}.png`)
        d3.select('#current-description').append('div').text(`feels like: ${Math.round(data.current.feels_like)}°`).style('color', data.current.temp < 100 ? tempColor(data.current.temp) : '#FC7')
        
        d3.select('#current').select("#humidity").text(`${data.current.humidity}%`)

        let precipColor = x => {
            if (x == 0) return "#444444";
            else if (x < 2) return "#00BB11";
            else if (x < 10) return "#FFDD00";
            else if (x < 50) return "#FF0000";
            else return "#FF00FF";
        }

        let minuteData = data.minutely.map((x, i) => {return {startAngle: i * Math.PI / 30, endAngle: (i + 1) * Math.PI / 30 + .01, color: precipColor(x.precipitation)}})

        let minuteForecast = d3.select('#minute-forecast').selectAll('.arc').data(minuteData, (d, i) => i)

        let arc = d3.arc()
            .innerRadius(130)
            .outerRadius(150)

        minuteForecast.enter()
            .append('path')
            .classed('arc', true)
            .attr('d', arc)
            .merge(minuteForecast)
            .style('fill', d => d.color)
            .attr('transform', 'translate(150,150)')



        d3.select('#hourlyForecast').selectAll('.temp').remove()

        let hourlyForecast = d3.select('#hourlyForecast').selectAll('.temp').data(data.hourly)

        hourlyForecast.enter().append('div')
            .attr('class', 'temp')
            .style('background-color', d => tempColor(d.temp))
            

        let forecasts = d3.select('#forecast').selectAll('.forecast').data(data.daily)

        let forecastMin = d3.min(data.daily, d => d.temp.min)
        let forecastMax = d3.max(data.daily, d => d.temp.max)

        let tempScale = d3.scaleLinear().domain([forecastMin, forecastMax]).range([470, 770])

        forecasts.enter().append('p')
            .attr('class', 'forecast')
            .merge(forecasts)
            .html((d, i) => {
                const tempWidth = 54;
                let minTempPosition = tempScale(d.temp.min);
                let maxTempPosition = tempScale(d.temp.max);
                if (maxTempPosition - minTempPosition < 50) {
                    console.log(minTempPosition, maxTempPosition)
                    const overlap = minTempPosition - maxTempPosition;
                    minTempPosition -= overlap/2;
                    maxTempPosition += overlap/2;
                }
                const svgWidth = maxTempPosition - minTempPosition - tempWidth - 9;
                return `<span class='weekday'>${weekdays[new Date(d.dt*1000).getDay()]}</span> 
                <span class='forecast-description'>${d.weather[0].description}</span> 
                <span class='forecast-low' style='left:${tempScale(d.temp.min)}px; background:${tempColor(d.temp.min)}; background:${tempColor(d.temp.min)}; color:${d.temp.min < 90 ? '#000' : '#FC7'}'>${Math.round(d.temp.min)}°</span> 
                <svg style='left:${minTempPosition + tempWidth + 9}px; width: ${svgWidth}px'>
                    <defs>
                        <linearGradient id="linear${i}" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stop-color="${tempColor(d.temp.min)}" />
                        <stop offset="100%" stop-color="${tempColor(d.temp.max)}" />
                    </defs>
                    <rect x="0" y="17.5" width="${svgWidth}" height="5" fill="url(#linear${i})">
                </svg>
                <span class='forecast-high' style='left:${tempScale(d.temp.max)}px; background:${tempColor(d.temp.max)}; color:${d.temp.max < 90 ? '#000' : '#FC7'}'>${Math.round(d.temp.max)}°</span>`
            })
            .append('img').attr('src', d => `http://openweathermap.org/img/wn/${d.weather[0].icon}.png`)
            .attr('width', '50px')
            .attr('height', '50px')
        
        forecasts.exit().remove();

    })
}

function updateMilkyWay() {
    latitude = 30.44422
    longitude = -97.77187

    now = new Date()
    yesterday = new Date()
    yesterday.setDate(now.getDate() - 1)
    yesterday.setHours(12,0,0)
    today = new Date()
    today.setHours(12,0,0)
    tomorrow = new Date()
    tomorrow.setDate(now.getDate() + 1)
    tomorrow.setHours(12,0,0)

    let startTime = new Date()
    startTime.setMinutes(Math.floor(startTime.getMinutes() / 15)*15, 0)
    let endTime = new Date()
    //endTime.setHours(12, 0, 0)
    endTime.setDate(endTime.getDate() + 1)

    sunTimes = [yesterday, today, tomorrow].map(x => SunCalc.getTimes(x, latitude, longitude))
    moonTimes = [yesterday, today, tomorrow].map(x => SunCalc.getMoonTimes(x, latitude, longitude))
    galacticCenterTimes = [yesterday, today, tomorrow].map(x => SunCalc.getGalacticCenterTimes(x, latitude, longitude))

    moonTimes = []
    sunTimes = []
    gcTimes = []

    for (let i = -1; i <= 2; i++) {
        day = new Date()
        day.setDate(today.getDate() + i)
        day.setHours(12, 0, 0)
        moonTimes.push(SunCalc.getMoonTimes(day, latitude, longitude))
        //sunTime = SunCalc.getTimes(day, latitude, longitude)
        //sunTimes.push({'night': sunTime.night, 'nightEnd':sunTime.nightEnd})
        sunTimes.push(SunCalc.getTimes(day, latitude, longitude))
        gcTimes.push(SunCalc.getGalacticCenterTimes(day, latitude, longitude))
    }

    flatMoonTimes = [].concat.apply([], moonTimes.map(x => Object.entries(x))).map(x => {return {'time':x[1], 'type':x[0]}; }).sort((a, b) => a.time.valueOf() - b.time.valueOf())
    flatSunTimes = [].concat.apply([], sunTimes.map(x => Object.entries(x))).map(x => {return {'time':x[1], 'type':x[0]}; }).sort((a, b) => a.time.valueOf() - b.time.valueOf())
    flatGCTimes = [].concat.apply([], gcTimes.map(x => Object.entries(x))).map(x => {return {'time':x[1], 'type':x[0]}; }).sort((a, b) => a.time.valueOf() - b.time.valueOf())

    sunBlockTimes = []

    for (let i = 0; i < flatSunTimes.length - 1; i++) {
        let block = [flatSunTimes[i], flatSunTimes[i+1]]
        if (flatSunTimes[i].time < endTime) sunBlockTimes.push(block);
    }



    let height = 100;
    let width = 912;
    let galaxyLineRadius = 1000
    let moonDiameter = 12

    let margin = {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
    }

    let chartHeight = height - margin.top - margin.bottom;
    let chartWidth = width - margin.left - margin.right;

    const svg = d3.select("#milky-way").select('svg')
        .attr('height', height)
        .attr('width', width)

    svg.html('')

    const mask = svg.append('mask')
        .attr('id', 'chartMask')
        .append('rect')
        .attr('width', chartWidth)
        .attr('height', chartHeight)
        .attr('fill', 'white')

    const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`)

    const maskedG = svg.append('g')
        .attr('mask', 'url(#chartMask)')
        .attr('transform', `translate(${margin.left},${margin.top})`)

    xScale = d3.scaleTime().domain([startTime, endTime]).range([0, chartWidth])
    yScale = d3.scaleLinear().domain([0, Math.PI/2]).range([chartHeight, 0])

    // xAxis = d3.axisBottom(xScale)

    skyColors = {
        'nightSky': '#000026',
        'darkSky' : '#2c0b4d',
        'twilight': '#733973',
        'riseSet': '#b35071',
        'goldenHour': '#ffcc73',
        'daySky': '#ffff73'
    }

    gcColors = {
        'nightSky': '#f1ebd3',
        'darkSky' : '#7b6583',
        'twilight': '#8c5d86',
        'riseSet': '#b9607b',
        'goldenHour': '#febe7d',
        'daySky': '#ffff73'
    }

    sunColor = {
        'nadir': skyColors.nightSky,
        'nightEnd': skyColors.darkSky,
        'nauticalDawn': skyColors.twilight,
        'dawn': skyColors.riseSet,
        'sunrise': skyColors.riseSet,
        'sunriseEnd': skyColors.goldenHour,
        'goldenHourEnd': skyColors.daySky,

        'solarNoon': skyColors.daySky,
        'goldenHour': skyColors.goldenHour,
        'sunsetStart': skyColors.riseSet,
        'sunset': skyColors.riseSet,
        'dusk': skyColors.twilight,
        'nauticalDusk': skyColors.darkSky,
        'night': skyColors.nightSky
    }

    function gcColor(time) {
        let sunTimes = flatSunTimes.filter(x => x.time < time)
        let type = sunTimes[sunTimes.length - 1].type

        let colorTypes = {
            'nadir': gcColors.nightSky,
            'nightEnd': gcColors.darkSky,
            'nauticalDawn': gcColors.twilight,
            'dawn': gcColors.riseSet,
            'sunrise': gcColors.riseSet,
            'sunriseEnd': gcColors.goldenHour,
            'goldenHourEnd': gcColors.daySky,

            'solarNoon': gcColors.daySky,
            'goldenHour': gcColors.goldenHour,
            'sunsetStart': gcColors.riseSet,
            'sunset': gcColors.riseSet,
            'dusk': gcColors.twilight,
            'nauticalDusk': gcColors.darkSky,
            'night': gcColors.nightSky
        }

        return colorTypes[type]
    }

    sunBlocks = maskedG.selectAll('.sunBlock').data(sunBlockTimes)
        .enter()
        .append('rect')
        .attr('x', d => Math.floor(xScale(d[0].time)))
        .attr('y', 0)
        .attr('width', d => Math.ceil(xScale(Math.min(d[1].time, endTime)) - xScale(Math.min(d[0].time))))
        .attr('height', chartHeight)
        .attr('fill', d => sunColor[d[0].type])
        // .attr('fill', 'black')


    // g.append('g')
    // .attr('class', 'x-axis')
    // .attr('transform', `translate(0, ${chartHeight})`)
    // .call(xAxis)


    let moonPositions = []
    let gcPositions = []

    for (let i = 0; i < endTime.valueOf() - startTime.valueOf(); i += (endTime.valueOf() - startTime.valueOf())/60) {
        let time = new Date(startTime.valueOf() + i )
        // let position = SunCalc.getGCPosition(time, latitude, longitude)
        let position0 = SunCalc.getStarPosition(time, latitude, longitude, (17 + 47/60 + 58.9/3600), -(28 + 4/60  + 53/3600))
        let position =  SunCalc.getStarPosition(time, latitude, longitude, (17 + 45/60 + 37.2/3600), -(28 + 56/60 + 10/3600))
        let position1 = SunCalc.getStarPosition(time, latitude, longitude, (17 + 43/60 + 13.1/3600), -(29 + 47/60 + 18/3600))
        let result = {}
        result.time = time
        result.position0 = position0
        result.position = position
        result.position1 = position1
        if (position.altitude > 0) gcPositions.push(result)
        
        let moonPosition = SunCalc.getMoonPosition(time, latitude, longitude)
        moonPosition.time = time
        if (moonPosition.altitude > 0) moonPositions.push(moonPosition)
    }


    maskedG.selectAll('.gcPosition').data(gcPositions)
        .enter()
    .append('line')
        .attr('x1', d => xScale(d.time) + galaxyLineRadius*(d.position0.azimuth - d.position1.azimuth))
        .attr('x2', d => xScale(d.time) - galaxyLineRadius*(d.position0.azimuth - d.position1.azimuth))
        // .attr('x2', d => xScale(d.time) + 5)
        .attr('y1', d => yScale(d.position0.altitude) - galaxyLineRadius*(d.position0.altitude - d.position1.altitude))
        .attr('y2', d => yScale(d.position1.altitude) + galaxyLineRadius*(d.position0.altitude - d.position1.altitude))
        // .attr('y2', d => yScale(d.position1.altitude))
        .attr('stroke', d => gcColor(d.time))

    maskedG.selectAll('.gcPosition').data(gcPositions)
        .enter()
    .append('circle')
        .attr('cx', d => xScale(d.time))
        .attr('cy', d => yScale(d.position.altitude))
        .attr('r', 2)
        .attr('fill', d => gcColor(d.time))


    phase = SunCalc.getMoonIllumination(now).phase

    maskedG.selectAll('.moonPosition').data(moonPositions)
        .enter()
    .append('circle')
        .attr('cx', d => xScale(d.time))
        .attr('cy', d => yScale(d.altitude))
        .attr('r', 0.5*moonDiameter)
        .attr('fill', '#DDD')

    maskedG.selectAll('.moonPosition').data(moonPositions)
        .enter()
    .append('path')
        .attr('d', d => `M0 ${-0.5*moonDiameter} c${(2*phase % 1 - 0.5) * moonDiameter * 4/3} 0, ${(2*phase % 1 - 0.5) * moonDiameter * 4/3} ${moonDiameter}, 0 ${moonDiameter} c${(phase > 0.5 ? -1 : 1) * moonDiameter * 2/3} 0, ${(phase > 0.5 ? -1 : 1) * moonDiameter * 2/3} ${-moonDiameter}, 0 ${-moonDiameter}`)
        .attr('transform', d => `translate(${xScale(d.time)},${yScale(d.altitude)})`)
        .attr('fill', '#222')
}

function updatePollen() {
    d3.json('/pollen').then(function(data) {
        console.log('pollen data', data)
        data = data.data;

        let width = 125
        let height = 500

        // let x = d3.scaleLinear()
        //     .domain([0,  00])
        //     .range([0, width])

        let y = d3.scaleBand()
            .range([0, height])
            .domain(data.map(d => d.factor))
            .padding(0.1)
        
        d3.select('#pollen').html('')

        let g = d3.select('#pollen').data([0]).append('g')
            .attr('width', width)
            .attr('height', height)
            .attr('transform', 'translate(180,0)')

        let pollenBarChart = g.selectAll('.bar').data(data)

        g.append("g")
            .style('font-size', '30px')
            .call(d3.axisLeft(y).tickSize(0).tickPadding(10))
            .call(g => g.select(".domain").remove())
            
        pollenBarChart.enter()
            .append('rect')
            .classed('bar', true)
            .merge(pollenBarChart)
            .attr('x', 0)
            .attr('y', d => y(d.factor))
            // .attr('width', d => x(d.value))
            .attr('width', d => 250)
            .attr('height', y.bandwidth())
            .attr('fill', d => d.fillColor)
        
        pollenBarChart.enter()
            .append('text')
            .text(d => d.value)
            .attr('x', 10)
            .attr('y', d => y(d.factor) + y.bandwidth()/2 + 20)
            .attr('fill', d => d3.color(d.fillColor).darker(2))
            .style('font-weight', 600)
            .style('font-size', '60px')
        
    })
}

updateDateTime()
updateWeather()
updateMilkyWay()
updatePollen()
updateNews()

setInterval(updateDateTime, 1000);
setInterval(updateWeather, 5 * 60 * 1000)
setInterval(updateMilkyWay, 15 * 60 * 1000)
setInterval(updatePollen, 15 * 60 * 1000)
setInterval(updateNews, 60 * 60 * 1000)
