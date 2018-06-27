(function($){
    
	"use strict";


	var uploadMultiImage = function (options) {
        var $root = $(this);
        var $rootModal;
        var urlApi = options.urlApi || "";
        var single = options.single || false;
        var $selectResize , widthResize , heightResize;
        var sizeLimit = options.sizeLimit || false;
        var resizeMessage = options.resizeMessage || "";
        if(options.selectResize){
            $selectResize = $(options.selectResize);
            var valueResize = $selectResize.val().split("x");
            widthResize = valueResize[0];
            heightResize = valueResize[1];
        }else{
            $selectResize = false;
        }

        var resData = options.resData;

        var $hiddenInput = $root.find('input[type="hidden"]');
        var hiddenInput = ($hiddenInput.val().split(",")[0]) ? $hiddenInput.val().split(",") : [] ;

        var $selectedImage;


        var $imageCrop;
        var cropper;
        var options = {
            dragMode:"none",
            viewMode:1,
            zoomable:false
        };

        if($selectResize){
            options.aspectRatio = widthResize / heightResize;
            options.autoCropArea = 1;
            options.cropBoxResizable = false;
        }
		var init = function(){

            // init old data
            hiddenInput.forEach(element => {
                $root.find(".image-preview").append(templateImage(element));
            });

            var idModal = Date.now();
            $('body').append(templateModal(idModal) );

            $rootModal = $("#" + idModal);
            $imageCrop = $rootModal.find('#modal-crop-image .crop-image');

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
                    if(sizeLimit && input.files[i].size > sizeLimit){
                        alert(resizeMessage);
                        return false;
                    }
                    var form = new FormData();
                    form.append("uploadfile", input.files[i]);
    
                    uploadImage(form , function(data){
                        if(single){
                            $root.find(".image-preview").html(templateImage(eval(resData)));
                            hiddenInput = eval(resData);
                            $hiddenInput.val(eval(resData) );
                            return false;
                        }

                        $root.find(".image-preview").append(templateImage(eval(resData)));
    
                        // if val is empty add url image
                        if(!hiddenInput){
                            $hiddenInput.val(eval(resData));
                            return false;
                        }
    
                        // if value not empty update val input
                        hiddenInput.push(eval(resData));
                        
                        $hiddenInput.val(hiddenInput.join(','));
                    });
                }
            }
        }

        /*---------------------------------------
            CHANGE RATIO
        ------------------------------------------*/
        if($selectResize){
            $selectResize.on("change" , function(){
                var valueResize = $(this).val().split("x");
                widthResize = valueResize[0];
                heightResize = valueResize[1];
                cropper.options.aspectRatio = widthResize / heightResize;
            });
        }


        /*--------------------------------------------
            REMOVE IMAGE
        --------------------------------------------- */
        var onRemoveImage = function(){
            var $parent =  $(this).closest('.image-item');

            if(single){
                $hiddenInput.val('');
                $parent.remove();
                return false;
            }

            var dataImage = $parent.find('img').attr('data-image');
            // convert val to array
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
            var configResize = {}
            if(selectResize){
                configResize.width = widthResize;
                configResize.height = heightResize;
            }
            $imageCrop.cropper("getCroppedCanvas",configResize).toBlob(function (blob) {
                var file = new File([blob], $selectedImage.find('img').attr('data-image') );
                var form = new FormData();
                form.append("uploadfile",  file);

                uploadImage(form , function(data){
                    if(single){
                        $root.find(".image-preview").html(templateImage(eval(resData)));
                        hiddenInput = eval(resData);
                        $hiddenInput.val(eval(resData) );
                        // hidden popup
                        $rootModal.find('#modal-crop-image').modal('hide');
                        return false;
                    }



                    $root.find(".image-preview").append(templateImage(eval(resData)));

                    // if val is empty add url image
                    if(!hiddenInput){
                        $hiddenInput.val(eval(resData));
                        return false;
                    }

                    // if value not empty update val input
                    hiddenInput.push(eval(resData));
                    $hiddenInput.val(hiddenInput.join(','));


                    // convert val to array
                    var dataImage = $selectedImage.find('img').attr('data-image');
                    hiddenInput.splice(hiddenInput.indexOf(dataImage),1 );
                    $hiddenInput.val(hiddenInput.join(','));
                    $selectedImage.remove();

                    // hidden popup
                    $rootModal.find('#modal-crop-image').modal('hide');
                });
            });
        }; 

        //--------------------------------------------------------------   
        var uploadImage = function(form , callback){
            $.ajax({
                url: urlApi,
                data: form,
                processData: false,
                contentType: false,
                type: 'POST',
                success: function(data){
                    callback(data);
                }
            });
        };


        var templateImage = function(image){
            return `<div class='image-item'>
                <div class='tool-image'>
                    <button type="button" class='tool-item tool-view flaticon-search'></button>
                    <button type="button" class='tool-item tool-crop flaticon-crop' style='transition-delay: 0.1s;'></button>
                    <button type="button" class='tool-item tool-remove flaticon-rubbish-bin' style='transition-delay: 0.2s;'></button>
                </div>
                <img data-image='${image}' src="${image}"/>
            </div>`
        };

        var templateModal = function(idModal){
            return `
            <div id="${idModal}">
                <!-- Modal -->
                <div class="modal fade" id="modal-detail-image" tabindex="-1" role="dialog" aria-hidden="true">
                    <div class="modal-dialog modal-dialog-centered" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                            <h5 class="modal-title">Preview image</h5>
                        </div>
                        <div class="modal-body">
                            <img class='detail-image' src='/download.jpg' style='display:block;margin:auto;max-width:100%;'/>
                        </div>
                    </div>
                    </div>
                </div>

                <!-- Modal -->
                <div class="modal fade" id="modal-crop-image" data-backdrop="static" data-keyboard="false"  tabindex="-1" role="dialog" aria-hidden="true">
                    <div class="modal-dialog modal-dialog-centered" role="document">
                        <div class="modal-content">
                            <div class="modal-header">
                                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                                <h5 class="modal-title">Crop image</h5>
                            </div>
                            <div class="modal-body">
                                <div>
                                    <img class='crop-image' src='/download.jpg' style='display:block;width:100% !important;'/>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-danger crop-cancel">Cancel</button>
                                <button type="button" class="btn btn-primary crop-action">Crop</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`
        }

        
        //init
        init.call(this);
    };
    

    $.fn.uploadMultiImage = uploadMultiImage;

  

})(jQuery);



