/*************************************************************
 *  Arc drawing logic section.
 * 
 *************************************************************/

/**
 * Clear left-eye, right-eye and mouth.
 */
function clear_containers(){
    d3.selectAll("svg > *").remove();
}


/**
 * Clears container with id
 * @param id DOM-elements id
 */
function clear_container(id){
    d3.select(`#${id} > *`).remove();
}


/**
Creates an arc and puts in container.

@param container - container is one of the ids (left-eye, rifht-eye, mouth).
@param w - width of arc
@param h - acr thickness
@param invert - Rotate arc on 180 degree

Arc parameters:
@@ - h (thickness)

        @@@@@@        ^ 
       @@@@@@@@       |
      @@   ^  @@      |
     @@    |    @@    |
    @@    r_in   @@ height
    @@     |     @@   |
           * <-- center
       r_out------>   
    <---width----->

Inverted arc:

           *<--center
    @@           @@
    @@           @@
     @@         @@
      @@       @@
        @@@@@@@
        @@@@@@@
       r_out------>   
    <---width----->
*/
function draw_arc(container, w, h, invert=false){
    // Compute arc parameters
    let r_outter = w/2
    let r_inner = r_outter - h
    let r_corner = h/2
    let width = w
    let height = r_outter
    let start_angle  = -Math.PI/2; 
    let end_angle = Math.PI/2;
    let arc_center_x = width/2;
    let acr_center_y = height;
    if (invert){
        start_angle  = Math.PI/2; 
        end_angle = 3*Math.PI/2;
        acr_center_y = 0
    }
    console.log(`r_inner:${r_inner}, r_outter:${r_outter}, width:${width}, height:${height}`)
   
    //Create arc
    let arc = d3.arc()
    .innerRadius(r_inner)
    .outerRadius(r_outter)
    .startAngle(start_angle)
    .endAngle(end_angle)
    .cornerRadius(r_corner)

    //Create svg
    clear_container(container)
    let svg = d3.select(`#${container}`) 
    .append("svg") 
    .attr("width", width) // setting fixed width
    .attr("height", height) 

    svg.append("path") 
    .attr("transform", `translate(${arc_center_x},${acr_center_y})`)
    .attr("class", "arc") 
    .attr("d", arc) 
    .attr("fill","#1E85FF")
}


/**
Creates line and puts in container.
@param container - container is one of the ids (left-eye, rifht-eye, mouth).
@param w - width of line
@param h - line thickness
*/
function draw_line(container, w, h){
    console.log(`w:${w}, h:${h}`)

    //Compute line parameters
    round_corner_offset = h/2;
    let width = w;
    w = w - round_corner_offset*2;
    console.log(`w:${w}, h:${h}, round_corner_offset:${round_corner_offset}`)

    
    //Create svg
    clear_container(container)
    let svg = d3.select(`#${container}`) 
    .append("svg") 
    .attr("width", width ) // setting fixed width
    .attr("height", h) 

    //Create line
    svg.append('line')
    .attr('x1', round_corner_offset)
    .attr('y1', h/2)
    .attr('x2', w)
    .attr('y2',h/2)
    .attr('stroke', '#1E85FF')
    .attr('stroke-width', `${h}`)
    .attr('stroke-linecap', 'round')
}



/*************************************************************
 *  Mimic animation via anime.js logic section.
 * 
 *************************************************************/

var left_eye_timeline;
var right_eye_timeline;
var mouth_timeline;


function check_easing(easing){
    if (easing && easing !='string'){
        return true
    }
    return false
}

/**
 * Converts data from server format to anime.js format.
 * @param {*} data 
 * @returns List of lists [[{left-eye}, {right-eye}, {mouth}], [{}, {}, {}], ...].
 * Each sublist includes 3 objects (for left-eye, right-eye and mouth).
 * Object attributes as in https://animejs.com/documentation/
 */
function to_anime_data_format(data){
    result = []
    objs = ['left_eye', 'right_eye', 'mouth'] // server names

    for (const [index, mimic_item] of data.entries()){
        frame = []
        for (let obj of objs){
            let DOM_id = `#${obj.replace(/_/g, '-')}` // to DOM name

            command = {
                targets: DOM_id,
                translateX: mimic_item[`x_${obj}`],
                translateY: mimic_item[`y_${obj}`],
                duration: 300,
                endDelay: mimic_item['delay'],
                easing: check_easing(mimic_item['easing']) ? mimic_item['easing'] : 'linear',
                // Callback runs before mimic tramslation begins.
                // Changes style of mimic.
                begin: function(a, m=mimic_item, elem=obj) {
                    let id = obj.replace(/_/g, '-')
                    let w = m[`w_${elem}`]
                    let h = m[`h_${elem}`]
                    let style = m[`style_${elem}`]
                    console.log('start callback')
                    switch(style) {
                        case 0: // Arc
                            console.log('arc')
                            draw_arc(id, w, h)
                            break
                        case 1: //Line
                            console.log('line')
                            draw_line(id, w, h)
                            break
                        case 2: //Inverted arc
                            console.log('inverted arc')
                            draw_arc(id, w, h, invert=true)
                            break
                    }
                }
            }

            frame.push(command)
        }
        result.push(frame)
    }
    console.log('anime js result', result)
    return result
}

/**
 * Plays mimic on screen.
 * Converts server data to anime.js data
 * Adds mimic_items on timelines.
 * Runs mimic on screen.
 * @param {*} data Data in server format
 */
function run_mimic(data){
    anime_data = to_anime_data_format(data)

    left_eye_timeline.reset()
    right_eye_timeline.reset()
    mouth_timeline.reset()
    left_eye_timeline = anime.timeline();
    right_eye_timeline = anime.timeline();
    mouth_timeline = anime.timeline();

    for (let obj of anime_data) {
        left_eye_timeline.add(obj[0])
        right_eye_timeline.add(obj[1])
        mouth_timeline.add(obj[2])
    }

}

// function test_data(){
//     json_data = `{ 
//         "mimic_items": [
//             {
//                 "style_left_eye": 2,
//                 "x_left_eye" : 100,
//                 "y_left_eye": 0,
//                 "w_left_eye" : 300,
//                 "h_left_eye" : 40,
            
//                 "style_right_eye": 2,
//                 "x_right_eye" : 100,
//                 "y_right_eye" : 0,
//                 "w_right_eye" : 300,
//                 "h_right_eye" : 40,
            
//                 "style_mouth": 1,
//                 "x_mouth" : 0,
//                 "y_mouth" : 50,
//                 "w_mouth" : 300,
//                 "h_mouth" : 40,
            
//                 "delay" : 500,
//                 "easing": "",
//                 "order": 0 

//             },

//             {
//                 "style_left_eye": 2,
//                 "x_left_eye" : 0,
//                 "y_left_eye": 0,
//                 "w_left_eye" : 300,
//                 "h_left_eye" : 40,
            
//                 "style_right_eye": 2,
//                 "x_right_eye" : 0,
//                 "y_right_eye" : 0,
//                 "w_right_eye" : 300,
//                 "h_right_eye" : 40,
            
//                 "style_mouth": 1,
//                 "x_mouth" : 0,
//                 "y_mouth" : 0,
//                 "w_mouth" : 300,
//                 "h_mouth" : 40,
            
//                 "delay" : 1000,
//                 "easing": "",
//                 "order": 1 

//             },

//             {
//                 "style_left_eye": 0,
//                 "x_left_eye" : 0,
//                 "y_left_eye": 0,
//                 "w_left_eye" : 300,
//                 "h_left_eye" : 40,
            
//                 "style_right_eye": 0,
//                 "x_right_eye" : 0,
//                 "y_right_eye" : 0,
//                 "w_right_eye" : 300,
//                 "h_right_eye" : 40,
            
//                 "style_mouth": 2,
//                 "x_mouth" : 0,
//                 "y_mouth" : 0,
//                 "w_mouth" : 300,
//                 "h_mouth" : 40,
            
//                 "delay" : 5,
//                 "easing": "",
//                 "order": 2 

//             }
//         ]
//     }`;

//     data = JSON.parse(json_data)['mimic_items'] // Array of mimic_items
//     run_mimic(data)
// }

// function test(){
//     test_data();
//     var delay = 1000; //1 second

//     // setTimeout(function() {
//     //     console.log('aborted')
//     //     test_data()
//     // }, delay);
// }


/*************************************************************
 *  Websocket logic section.
 * 
 *************************************************************/
 
var socket;
function connect() {
	socket = new WebSocket(`ws://127.0.0.1:8001/websocket`);

    socket.onmessage = function(event) {
        data = JSON.parse(event.data)['mimic_items'] // Array of mimic_items
        console.log('from server', data)
        run_mimic(data)
    };
    
    socket.onclose = function(event) {
        console.log('socket close');
        setTimeout(function() {connect();}, 1000);
    }

    socket.onerror = function(event) {
        console.log('socket error');
        setTimeout(function() {connect();}, 1000);
    }
}



connect();


/*************************************************************
 *  Initial logic section.
 * 
 *************************************************************/

/**
 * Draws default mimic.
 */
function init_mimic(){
    draw_arc('left-eye', 300, 40, invert=true)
    draw_arc('right-eye', 300, 40, invert=true)
    draw_line('mouth', 300, 40)

    left_eye_timeline = anime.timeline();
    right_eye_timeline = anime.timeline();
    mouth_timeline = anime.timeline();
}

$(window).on('load', function() {
    init_mimic();
});

