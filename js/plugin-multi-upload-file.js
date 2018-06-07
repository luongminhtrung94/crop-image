(function($){
    
	"use strict";


	var uploadMultiImage = function (options) {
        var $root = $(this);
        var $rootModal = $(options.dataModal);
        var $hiddenInput = $root.find('input[type="hidden"]');
        var $selectedImage;
        var $imageCrop = $rootModal.find('#modal-crop-image .crop-image');
        console.log($imageCrop);
        var options = {
            dragMode:"none",
            viewMode:1,
            zoomable:false
        };
        var cropper;

		var init = function(){
            $root.on("change" ,  ".input-upload-file" , onChangeInput);
            $root.on('click' , '.tool-remove' , onRemoveImage);
            $root.on('click' , '.tool-view' , onViewImage);
            $root.on('click' , '.tool-crop' , onCropPopup);
            $rootModal.on("click" , ".crop-cancel" , onCancelCrop);
            $rootModal.on("click", ".crop-action" , onCropImage);
        };


        var onChangeInput = function() {
            readURL(this);
            $(this).val('');
            
            // CONVERT IMAGE TO BASE 64
            function readURL(input) {
                
                for(var i = 0 ; i < input.files.length ; i++){
                    var form = new FormData();
                    form.append("uploadfile", input.files[i]);
    
                    uploadImage(form , function(data){
                        $root.find(".image-preview").append(templateImage('http://localhost:8000' + data.url , data.url));
    
                        var hiddenInput = $hiddenInput.val();
    
                        // if val is empty add url image
                        if(!hiddenInput){
                            $hiddenInput.val(data.url);
                            return false;
                        }
    
                        // if value not empty update val input
                        hiddenInput = hiddenInput.split(',');
                        hiddenInput.push(data.url);
                        
                        $hiddenInput.val(hiddenInput.join(','));
                    });
                }
            }
        }

        /*--------------------------------------------
            REMOVE IMAGE
        --------------------------------------------- */
        var onRemoveImage = function(){
            var $parent =  $(this).closest('.image-item');
            var hiddenInput = $hiddenInput.val();

            var dataImage = $parent.find('img').attr('data-image');
            // convert val to array
            hiddenInput = hiddenInput.split(',');
            hiddenInput.splice(hiddenInput.indexOf(dataImage),1 );

            $hiddenInput.val(hiddenInput.join(','));
            $parent.remove();
        };

        /*---------------------------------------------
            DETAIL IMAGE
        ------------------------------------------------- */
        var onViewImage = function(){
            var $parent = $(this).closest('.image-item');
            var url = $parent.find('img').attr('src');
            $rootModal.find('#modal-detail-image .detail-image').attr('src' , url);
            $rootModal.find('#modal-detail-image').modal('show');
        };

        /*--------------------------------------------------
            CROP POPUP
        ----------------------------------------------------- */
        var onCropPopup = function(){
            var $parent = $(this).closest(".image-item");
            var urlImage = $parent.find("img").attr("src");
            $selectedImage =  $parent;

            $rootModal.find("#modal-crop-image").on("shown.bs.modal", function() {
                
                $imageCrop.cropper(options);
                cropper = $imageCrop.data('cropper');
                cropper.replace(urlImage);
            });

            $rootModal.find('#modal-crop-image').modal('show');
        };

        /*---------------------------------------------------
            CROP CANCEL
        ----------------------------------------------------*/
        var onCancelCrop = function(){
            $rootModal.find("#modal-crop-image").modal("hide");
        };

        /*--------------------------------------------------
            CROP IMAGE
        ------------------------------------------------------ */
        var onCropImage =  function(){
            console.log($imageCrop);
            $imageCrop.cropper("getCroppedCanvas").toBlob(function (blob) {
                var file = new File([blob], "jpg" );
                var form = new FormData();
                form.append("uploadfile",  file);

                uploadImage(form , function(data){
                    $root.find(".image-preview").append(templateImage('http://localhost:8000' + data.url , data.url));

                    var hiddenInput = $hiddenInput.val();

                    // if val is empty add url image
                    if(!hiddenInput){
                        $hiddenInput.val(data.url);
                        return false;
                    }

                    // if value not empty update val input
                    hiddenInput = hiddenInput.split(',');
                    hiddenInput.push(data.url);
                    $hiddenInput.val(hiddenInput.join(','));


                    // remove old image
                    var hiddenInput = $hiddenInput.val();
                    // convert val to array
                    var dataImage = $selectedImage.find('img').attr('data-image');
                    hiddenInput = hiddenInput.split(',');
                    hiddenInput.splice(hiddenInput.indexOf(dataImage),1 );
                    $hiddenInput.val(hiddenInput.join(','));
                    $selectedImage.remove();

                    // hidden popup
                    $rootModal.find('#modal-crop-image').modal('hide');
                });
            });
        }; 


        //init
        init.call(this);
    };
    

    $.fn.uploadMultiImage = uploadMultiImage;

    //--------------------------------------------------------------   
    var uploadImage = function(form , callback){
        $.ajax({
            url: 'http://localhost:8000/uploads',
            data: form,
            processData: false,
            contentType: false,
            type: 'POST',
            success: function(data){
                callback(data);
            }
        });
    };
    
    
    var templateImage = function(image , data){
        return `<div class='image-item'>
            <div class='tool-image'>
                <button class='tool-item tool-view flaticon-search'></button>
                <button class='tool-item tool-crop flaticon-crop' style='transition-delay: 0.1s;'></button>
                <button class='tool-item tool-remove flaticon-rubbish-bin' style='transition-delay: 0.2s;'></button>
            </div>
            <img data-image='${data}' src="${image}"/>
        </div>`
    };

})(jQuery);



