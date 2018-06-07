/*---------------------------------------
    INITIAL IMAGE TO CROP
------------------------------------------*/
window.widthImage = 1920;
window.heightImage = 150;
var imageFile;
var $image = $('#image');
var options = {
    cropBoxResizable:false,
    autoCropArea:1,
    dragMode:"none",
    aspectRatio: window.widthImage   / window.heightImage  ,
    viewMode:1,
    zoomable:false
};

$image.cropper(options);
var cropper  =  $image.data('cropper');


/*---------------------------------------
    CHANGE RATIO
------------------------------------------*/
$("#select").on("change" , function(){
    window.widthImage = $(this).val().split("x")[0];
    window.heightImage = $(this).val().split("x")[1];
    cropper.options.aspectRatio = +window.widthImage / +window.heightImage;
    if($(".image-container").css("display") == "block"){
        $("#upload-image").trigger("change");
    }
});
/*---------------------------------------
    LOAD IMAGE LOCAL
-----------------------------------------*/        
$("#upload-image").change(function() {
    var flag = true;
    readURL(this);
    if(!flag){ return false }
    
    $(".image-container").show();
    $("#crop-image-cropped").show();
    $("#cancel-image-cropped").show();
    $(".preview-image-container").hide();

    // CONVERT IMAGE TO BASE 64
    function readURL(input) {
        if (input.files && input.files[0] && input.files[0].size <  2 * 1024 * 1000) {
            var reader = new FileReader();
            reader.onload = function(e) {
                $('#image').attr('src', e.target.result);
                cropper.replace(e.target.result);
            }
            reader.readAsDataURL(input.files[0]);
        }else{
            $(".image-container").hide();
            $("#upload-image").val("");
            $("#crop-image-cropped").hide();
            $("#cancel-image-cropped").hide();
            $(".preview-image-container").show();
            alert("vui lòng chọn hình có kích thước nhỏ hơn");
            flag = false;
        }
    }
});

/*----------------------------------------
    SHOW IMAGE CROPPED
------------------------------------------*/
$("#crop-image-cropped").on('click', function () {
    $(".image-container").hide();
    $("#crop-image-cropped").hide();
    $("#cancel-image-cropped").hide();
    $(".preview-image-container").show();

    $image.cropper('getCroppedCanvas',{
        width: +window.widthImage,
        height: +window.heightImage
    }).toBlob(function (blob) {
        imageFile = blob;

        //get size file
        var reader = new FileReader();
        reader.readAsDataURL(blob); 
        reader.onloadend = function() {
            $("#preview-image").attr("src" , reader.result);

            var img = new Image();
            img.onload =function() {
                var width = img.width,
                    height = img.height;    
                $(".size-image-cropped").text(width + "x" + height);
            };
            img.src = reader.result;
        }

        //submit image
        var form = new FormData();
        form.append("image", new File([imageFile], $("#upload-image").val().split("\\")[ $("#upload-image").val().split("\\").length - 1] ) );
        $.ajax({
            url: 'http://example.com/script.php',
            data: form,
            processData: false,
            contentType: false,
            type: 'POST',
            success: function(data){
                alert(data);
            }
        });
        $("#upload-image").val("");

    });
});

/*----------------------------------------------
    CANCEL CROP IMAGE
-----------------------------------------------*/
$("#cancel-image-cropped").on("click" , function(){
    imageFile = "";

    $(".image-container").hide();
    $("#upload-image").val("");
    $("#crop-image-cropped").hide();
    $("#cancel-image-cropped").hide();
    $(".preview-image-container").show();
});


//--------------------------------------------------------------        
function blobToFile(theBlob, fileName){
    theBlob.lastModifiedDate = new Date();
    theBlob.name = fileName;
    return theBlob;
}