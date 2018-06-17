
// i Created My Api and published to AWS , because yours was without pictures .
const URL = 'http://ec2-18-130-84-222.eu-west-2.compute.amazonaws.com:3000';


// main vuejs app component
const app = new Vue({
    // component id attribute
    el: '#tomaxApp',
    // components data should be a function
    data: function () {
        return {
            users: [],
            publicUrl: URL
        }
    },
    methods: {
        allowDrop: function (e) {
            e.preventDefault();
        },
        // extracted help library rotatejs
        rotate: function(element) {
            let R2D, active, angle, center, init, rotate, rotation, start, startAngle, stop;
            active = false;
            angle = 0;
            rotation = 0;
            startAngle = 0;
            center = {
                x: 0,
                y: 0
            };
            document.ontouchmove = function(e) {
                return e.preventDefault();
            };
            init = function(element) {
                element.addEventListener("mousedown", start, false);
                element.addEventListener("mousemove", rotate, false);
                return element.addEventListener("mouseup", stop, false);
            };
            R2D = 180 / Math.PI;
            start = function(e) {
                var height, left, top, width, x, y, _ref;
                e.preventDefault();
                _ref = this.getBoundingClientRect(), top = _ref.top, left = _ref.left, height = _ref.height, width = _ref.width;
                center = {
                    x: left + (width / 2),
                    y: top + (height / 2)
                };
                x = e.clientX - center.x;
                y = e.clientY - center.y;
                startAngle = R2D * Math.atan2(y, x);
                return active = true;
            };
            rotate = function(e) {
                var d, x, y;
                e.preventDefault();
                x = e.clientX - center.x;
                y = e.clientY - center.y;
                d = R2D * Math.atan2(y, x);
                rotation = d - startAngle;
                if (active) {
                    return this.style.webkitTransform = "rotate(" + (angle + rotation) + "deg)";
                }
            };
            stop = function() {
                angle += rotation;
                return active = false;
            };
            init(element);
        },
        drop: function (e) {
            const smileId = e.dataTransfer.getData('smileId');  // getting our custom dragging key and it value
            const draggedSmile = document.getElementById(smileId);
            draggedSmile.className += ' resizable'; // element becomes resizable after it dropped on stage
            draggedSmile.style.position = 'inherit';
            draggedSmile.style.width = '15%';
            draggedSmile.style.left = e.clientX - (e.clientX - e.offsetX) + 'px'; // remain element on same relative position from left
            draggedSmile.style.top = e.clientY - (e.clientY - e.offsetY) + 'px'; // remain element on same relative position from top
            this.rotate(draggedSmile);
            e.target.appendChild(draggedSmile);
            this.removeUser(smileId);
        },
        beforeMount: function () {
            window.addEventListener('dragover', this.allowDrop); // adding dragover event listener
            window.addEventListener('drop', this.drop);  // adding drop event listener
        },
        beforeDestroy: function () {
            window.removeEventListener('dragover', this.allowDrop);  // removing listener
            window.removeEventListener('drop', this.drop); // removing listener
        },
        removeUser: function (id) {
            this.users = this.users.filter(user => user.id != id);  //es6 filtering users from right list when they already on the stage
        },
        printStage: function() {
            var node = document.getElementById('stage');
            // some helper library converts dom element to blob data and downloads it
            domtoimage.toJpeg(node,{ quality: 0.95 })
                .then(dataUrl => {
                    const link = document.createElement('a');
                    link.download = 'result.jpeg';
                    link.href = dataUrl;
                    link.click()
                }).catch(error => console.error('download error', error));
        }
    },
    created() {
        // Fetches users when the component is created.    ( i did my own nodejs API and published it to AWS services)
        axios.get(`${URL}/api/users`)
            .then(response => this.users = response ? response.data : this.users)
            .catch(err => console.log(err));
    }
});

// separate component for interable user single element
Vue.component('user-item', {
    props: ['user', 'url'],
    data: function () {
        return {
            id: null  // this is for <img> that we dragging and resizing
        }
    },
    methods: {
        dragStart: function (e) {
            // before drag we should provide to dataTransfer some id and catch it when drag event ends outside our elements parent
            e.dataTransfer.setData("smileId", e.target.id);
        }
    },
    beforeMount: function () {
        window.addEventListener('dragstart', this.dragStart);  //removing event before component mount
    },
    beforeDestroy: function () {
        window.removeEventListener('dragstart', this.dragStart); //removing event before component mount
    },
    template: '<div>' +
    '<h4>{{user.name}} קוד {{user.id}} שם</h4>' +
    '<img ' +
    'draggable="true"' +
    '@dragstart="dragStart" ' +
    'class="smile" ' +
    ':id="user.id"' +
    ':src="url + user.picture">' +
    '</div>'
});

// adding dropzone class where we will drop our smiles
interact('.stage')
    .dropzone({
        // keep the edges inside the parent
        restrictEdges: {
            outer: 'parent',
            endOnly: true,
        },
        // Require a 75% element overlap for a drop to be possible
        overlap: 0.75
    });

// class resizable after we took it from right menu
interact('.resizable')
    .resizable({
        // resize from all edges and corners
        edges: {left: true, right: true, bottom: true, top: true},
        // minimum size
        restrictSize: {
            min: {width: 60, height: 60},
        },
    })
    .on('resizemove', function (event) {
        let target = event.target;
        let x = (parseFloat(target.getAttribute('data-x')) || 0);
        let y = (parseFloat(target.getAttribute('data-y')) || 0);
        // update the element's style
        target.style.width = event.rect.width + 'px';
        target.style.height = event.rect.height + 'px';
        // translate when resizing from top or left edges
        x += event.deltaRect.left;
        y += event.deltaRect.top;
        target.style.webkitTransform = target.style.transform = 'translate(' + x + 'px,' + y + 'px)';
        target.setAttribute('data-x', x);
        target.setAttribute('data-y', y);
        // target.textContent = Math.round(event.rect.width) + '\u00D7' + Math.round(event.rect.height);
    });