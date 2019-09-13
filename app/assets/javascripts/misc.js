function loadImages(arr, callback) {
    var images = {};
    var loadedImageCount = 0;

    for (var i = 0; i < arr.length; i++){
        var img = new Image();
        img.onload = imageLoaded;
        img.src = arr[i];
        images[arr[i]] = img;
    }

    function imageLoaded() {
        loadedImageCount++;
        if (loadedImageCount >= arr.length) {
            callback(images);
        }
    }
}

function are_crossing (r1, r2) {
    var dist = 0.001;
    return !(r2.left + dist > r1.right ||
    r2.right < r1.left + dist ||
    r2.top + dist > r1.bottom ||
    r2.bottom < r1.top + dist);
}

function crossing_value(section1, section2) {
    if (section1.right <= section2.left || section2.right <= section1.left) {
        return 0;
    }
    if (section1.right >= section2.left && section1.right <= section2.right) {
        return section1.right - section2.left;
    } else if (section2.right >= section1.left && section2.right <= section1.right) {
        return section2.right - section1.left;
    } else if (section1.right >= section2.right && section1.left <= section2.left) {
        return section2.right - section2.left;
    } else {
        return section1.right - section1.left;
    }
}