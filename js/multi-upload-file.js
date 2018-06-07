/*---------------------------------------
    INITIAL IMAGE TO CROP
------------------------------------------*/
var $selectedUrl;
var $image = $('#modal-crop-image .crop-image');
var options = {
    dragMode:"none",
    viewMode:1,
    zoomable:false
};
var cropper;

/*---------------------------------------
    LOAD IMAGE LOCAL
-----------------------------------------*/        
$(".multi-upload-file").on("change",".input-upload-file",function() {
    var $parent = $(this).closest(".multi-upload-file");
    var flag = true;
    readURL(this);
    $(this).val('');
    if(!flag){ return false }
    
    // CONVERT IMAGE TO BASE 64
    function readURL(input) {
        
        for(var i = 0 ; i < input.files.length ; i++){
            var form = new FormData();
            form.append("uploadfile", input.files[i]);

            $.ajax({
                url: 'http://localhost:8000/uploads',
                data: form,
                processData: false,
                contentType: false,
                type: 'POST',
                success: function(data){
                    $parent.find(".image-preview").append(templateImage('http://localhost:8000' + data.url , data.url));

                    var hiddenInput = $parent.find('input[type="hidden"]').val();

                    // if val is empty add url image
                    if(!hiddenInput){
                        $parent.find('input[type="hidden"]').val(data.url);
                        return false;
                    }

                    // if value not empty update val input
                    hiddenInput = hiddenInput.split(',');
                    hiddenInput.push(data.url);
                    $parent.find('input[type="hidden"]').val(hiddenInput.join(','));
                }
            });
        }
    }
});

/*--------------------------------------------
    REMOVE IMAGE
--------------------------------------------- */
$(".multi-upload-file").on('click' , '.tool-remove' , function(){
    var $parent =  $(this).closest('.image-item');
    var $root = $(this).closest('.multi-upload-file');
    var hiddenInput = $root.find('input[type="hidden"]').val();

    // convert val to array
    var dataImage = $parent.find('img').attr('data-image');
    hiddenInput = hiddenInput.split(',');
    hiddenInput.splice(hiddenInput.indexOf(dataImage),1 );
    $root.find('input[type="hidden"]').val(hiddenInput.join(','));
    $parent.remove();
});

/*---------------------------------------------
    DETAIL IMAGE
------------------------------------------------- */
$(".multi-upload-file").on('click' , '.tool-view' , function(){
    var $parent = $(this).closest('.image-item');
    var url = $parent.find('img').attr('src');
    $('#modal-detail-image .detail-image').attr('src' , url);
    $('#modal-detail-image').modal('show');
});

/*--------------------------------------------------
    CROP POPUP
----------------------------------------------------- */
$('.multi-upload-file').on('click' , '.tool-crop' , function(){
    var $parent = $(this).closest(".image-item");
    var urlImage = $parent.find("img").attr("src");
    $selectedUrl =  $parent;

    $("#modal-crop-image").on("shown.bs.modal", function() {
        
        $image.cropper(options);
        cropper = $image.data('cropper');
        cropper.replace(urlImage);
    });

    $('#modal-crop-image').modal('show');
});

/*---------------------------------------------------
    CROP CANCEL
----------------------------------------------------*/
$(".crop-cancel").on("click" ,function(){
    $("#modal-crop-image").modal("hide");
});

/*--------------------------------------------------
    CROP IMAGE
------------------------------------------------------ */
$(".crop-action").on("click" , function(){
    $image.cropper("getCroppedCanvas").toBlob(function (blob) {
        var file = new File([blob], "jpg" );
        var form = new FormData();
        form.append("uploadfile",  file);

        var $parent = $(".multi-upload-file");

        $.ajax({
            url: 'http://localhost:8000/uploads',
            data: form,
            processData: false,
            contentType: false,
            type: 'POST',
            success: function(data){
                $parent.find(".image-preview").append(templateImage('http://localhost:8000' + data.url , data.url));

                var hiddenInput = $parent.find('input[type="hidden"]').val();

                // if val is empty add url image
                if(!hiddenInput){
                    $parent.find('input[type="hidden"]').val(data.url);
                    return false;
                }

                // if value not empty update val input
                hiddenInput = hiddenInput.split(',');
                hiddenInput.push(data.url);
                $parent.find('input[type="hidden"]').val(hiddenInput.join(','));


                // remove old image
                var hiddenInput = $parent.find('input[type="hidden"]').val();
                // convert val to array
                var dataImage = $parent.find('img').attr('data-image');
                hiddenInput = hiddenInput.split(',');
                hiddenInput.splice(hiddenInput.indexOf(dataImage),1 );
                $parent.find('input[type="hidden"]').val(hiddenInput.join(','));
                $selectedUrl.remove();

                // hidden popup
                $('#modal-crop-image').modal('hide');
            }
        });
    });
}); 

//--------------------------------------------------------------        
function templateImage(image , data){
    return `<div class='image-item'>
        <div class='tool-image'>
            <button class='tool-item tool-view flaticon-search'></button>
            <button class='tool-item tool-crop flaticon-crop' style='transition-delay: 0.1s;'></button>
            <button class='tool-item tool-remove flaticon-rubbish-bin' style='transition-delay: 0.2s;'></button>
        </div>
        <img data-image='${data}' src="${image}"/>
    </div>`
}