$(function() {
	var personalInfor = {
			//验证身份证号正确
			verifyCardUrl: baseFn.baseUrl + 'candidates/search_card_id',
			//身份证件照
			cardImage: null,
			//证件照
			paperImage: null,
			//提示组件
			dialogTip: new Dialog("#cropper-wrapper", {
				isClickMaskHide: false,
				position: "middle"
			}),
			handleFun: {
				//身份证上传处理函数
				handleFinalCardImage: function(callback) {
					personalInfor.cardImage = callback.img_url;
				},
				handleFinalPaperImage: function(callback) {
					personalInfor.paperImage = callback.img_url;
				},
				//证件照上传中间件处理函数
				handlePaperImage: function($this, imageData, fn) {
					var $cropWrapper = $('.cropper-image');
					var $cropperImage = $('.cropper-image > img');
					var cropperWidth = $(window).width() * 0.9 - 20;
					var cropperHeight = cropperWidth / 3 * 4;
					var clientHeight = $(window).height();
					if(cropperHeight > clientHeight) cropperHeight = clientHeight * 0.9;
					$cropWrapper.height(cropperWidth / 3 * 4);
					$cropperImage.attr('src', imageData);
					personalInfor.dialogTip.show();
					$cropperImage.cropper({
						aspectRatio: 3 / 4,
						resizable: false,
					});
					//点击弹出框确定按钮
					$('#confirm-btn').off('click').on('click', function() {
							personalInfor.dialogTip.hide();
							var cropperImgSrc = $cropperImage.cropper('getCroppedCanvas').toDataURL();
							fn && fn($this, cropperImgSrc)
							$cropperImage.cropper('destroy');
						})
						//点击弹出框取消按钮
					$('#cancel-btn').off('click').on('click', function() {
						var loadingImage = $('#cropper-upload-image');
						var uploadImage = loadingImage.prev();
						$cropperImage.cropper('destroy');
						loadingImage.addClass('hide');
						if(!uploadImage.attr('src')) {
							uploadImage.addClass('transparent');
						}
						personalInfor.dialogTip.hide();
						baseFn.setPromptMsg('取消上传');
					})

				},
				vFormUpload: function(fn) {
					var userName = document.querySelector('#user-name').value.replace(/\s/gi, ''),
						cardNumber = document.querySelector('#card-number').value.replace(/\s/gi, ''),
						mondArea = document.querySelector('#areaSelect').value;
					if(!!userName) {
						if(!!cardNumber) {
							if(baseFn.validateForm.testDentityCard(cardNumber)) {
								baseFn.setCommonAjax(personalInfor.verifyCardUrl, {
									query_name: cardNumber,
									candidate_id: baseFn.allViewObj.candidate.talent_id
								}, 'POST', false, null, function(callback) {
									if(callback.status === 'success') {
										if(!!mondArea) {
											if(!!personalInfor.cardImage) {
												if(!!personalInfor.paperImage) {
													var callback = {
														talent_name: userName,
														card_id: cardNumber,
														card_url: personalInfor.cardImage,
														portrait_url: personalInfor.paperImage,
														province: mondArea.split(' ')[0],
														city: mondArea.split(' ')[1] || '',
														region: mondArea.split(' ')[2] || ''
													}
													fn && fn(callback);
												} else {
													baseFn.toastTip.setText('请上传证件照');
													baseFn.toastTip.show();
												}
											} else {
												baseFn.toastTip.setText('请上传身份证复印件');
												baseFn.toastTip.show();
											}
										} else {
											baseFn.toastTip.setText('请选择您的所在区域');
											baseFn.toastTip.show();
										}
									} else {
										baseFn.toastTip.setText(callback.msg || '出现未知问题，请联系客服！');
										baseFn.toastTip.show();
									}
								})
							} else {
								baseFn.toastTip.setText('身份证格式有误');
								baseFn.toastTip.show();
							}
						} else {
							baseFn.toastTip.setText('请输入您的身份证号码');
							baseFn.toastTip.show();
						}
					} else {
						baseFn.toastTip.setText('请输入您的姓名');
						baseFn.toastTip.show();
					}
				}
			},
			bindEvent: {
				initCitySelect: function() {
					//点击触发城市选择器
					var spCity = new SpCity({
						viewType: "area",
						data: province,
					});
					$('#areaSelect').on('click', function() {
						var that = $(this);
						spCity.setOnClickDone(function(e) {
							that.val(e.activeText.split('-').join(' '));
							e.hide();
						});
						spCity.show();
					})
				},
				//点击下一步验证表单跳转
				nextBtnClick: function() {
					document.querySelector('#next-btn').addEventListener('click', function() {
						personalInfor.handleFun.vFormUpload(function(callback) {
							baseFn.pageHandleData(callback);
							window.location.href = 'graduateInfor.html';
						})
					})
				}
			},
			//初始化事件处理
			initBindEvent: function() {
				personalInfor.bindEvent.initCitySelect();
				baseFn.bindEvent.uploadImages(function($this, imageData) {
					var type = $this.attr('data-type');
					if(type === 'cardImage') {
						baseFn.baseHandleFun.simpleUploadImageHandleFun($this, imageData, function(callback) {
							personalInfor.handleFun.handleFinalCardImage(callback);
						});
					} else {
						personalInfor.handleFun.handlePaperImage($this, imageData, function($this, imageData) {
							baseFn.baseHandleFun.simpleUploadImageHandleFun($this, imageData, function(callback) {
								personalInfor.handleFun.handleFinalPaperImage(callback);
							})
						})
					}
				});
				personalInfor.bindEvent.nextBtnClick();
			},
			//初始化数据处理
			initData: function() {
				baseFn.getAllView();
				var inforData = baseFn.baseHandleFun.cloneObj(baseFn.allViewObj.candidate);
				inforData['areaName'] = [inforData.province, inforData.city].join(' ');
				template.helper('addBaseImageSrc', function(src) {
					return(baseFn.imgBaseSrc + src);
				});
				//清除默认图片路径
				var DEFAULTIMGURL = '/assets/candidate/af_at_pho.png';
				inforData['card_url'] === DEFAULTIMGURL ? inforData['card_url'] = '' : inforData['card_url'] = inforData['card_url'];
				inforData['portrait_url'] === DEFAULTIMGURL ? inforData['portrait_url'] = '' : inforData['portrait_url'] = inforData['portrait_url'];
				personalInfor.cardImage = inforData['card_url'];
				personalInfor.paperImage = inforData['portrait_url'];
				var personalHtml = template('personInfor-tpl', inforData);
				document.getElementById('personInfor-main-wrapper').innerHTML = personalHtml;
			},
			init: function() {
				personalInfor.initData();
				personalInfor.initBindEvent();
			}
		}
		//初始化数据
	personalInfor.init();
})