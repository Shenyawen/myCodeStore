$(function() {
	var graduateInfor = {
		//查询学校地址;
		searchGraduateUrl: baseFn.baseUrl + 'candidates/search_edu_name',
		//查询专业地址
		searchMajorUrl: baseFn.baseUrl + 'candidates/search_major_name',
		bindEvent: {
			//触发一般选择器
			triggerSimpleSelect: function() {
				var date = new Date;
				var nowYear = date.getFullYear();
				$('.simple-select').off('click').on('click', function() {

					var eduList = ['博士', '硕士', '本科', '大专', '中专/职高', '其他'],
						listStr = '',
						YEARNUM = 50;
					var selectType = $(this).attr('data-type');
					if(selectType === 'high-edu') {
						for(var i = 0; i < eduList.length; i++) {
							listStr += '<li><a class="select-el" href="javascript:void(0)">' + eduList[i] + '</a></li>'
						}
					} else {
						for(var k = 0; k < YEARNUM; k++) {
							listStr += '<li><a class="select-el" href="javascript:void(0)">' + (nowYear - k) + '</a></li>'
						}
					}
					baseFn.initSelectDialog(listStr, $(this), baseFn.simpleDialogTip, $('#popup-box'));
				})
			},
			//触发输入查询选择器
			triggerSearchSelect: function() {
				$('.search-select').off('click').on('click', function() {
					var searchType = $(this).attr('data-type');
					var searchUrl = null;
					$('.select-wrapper').html('');
					$('.search-input').val('');
					baseFn.searchDialogTip.show();
					if(searchType === 'school') {
						searchUrl = graduateInfor.searchGraduateUrl;
					} else {
						searchUrl = graduateInfor.searchMajorUrl;
					}
					//第一次填充信息
					baseFn.baseHandleFun.searchInfor(searchUrl, {
						query_name: ''
					}, searchType, $(this), function(listStr, $this) {
						baseFn.initSelectDialog(listStr, $this, baseFn.searchDialogTip, $('#ative-popup-box'));
					})
					baseFn.bindEvent.inputSearch(searchUrl, searchType, $(this), function(listStr, $this) {
						baseFn.initSelectDialog(listStr, $this, baseFn.searchDialogTip, $('#ative-popup-box'));
					})
				})
			},
			//点击下一步
			clickNextBtn: function() {
				$('#next-btn').on('click', function() {
					graduateInfor.handleFun.vFormUpload(function(callback) {
						graduateInfor.handleFun.handleSubmitInfor(callback);
					});
				})
			}
		},
		handleFun: {
			handleFinalImage: function(callback) {
				graduateInfor.diplomaImage = callback.img_url;
			},
			//点击下一步验证表单
			vFormUpload: function(fn) {
				var eduInfor = $('#edu-infor').val();
				var schoolInfor = $('#school-infor').val();
				var schoolId = $('#school-infor').attr('data-id');
				var majorInfor = $('#major-infor').val();
				var majorId = $('#major-infor').attr('data-id');
				var eduDate = $('#edu-date').val();
				if(!!eduInfor) {
					if(!!schoolInfor) {
						if(!!majorInfor) {
							if(!!eduDate) {
								if(!!graduateInfor.diplomaImage) {
									var callback = {
										edu_name: schoolInfor,
										edu_id: schoolId,
										major_name: majorInfor,
										major_id: majorId,
										diploma_url: graduateInfor.diplomaImage,
										unm_year: eduDate,
										degree: eduInfor
									}
									fn && fn(callback);
								} else {
									baseFn.toastTip.setText('请上传毕业证/学位证');
									baseFn.toastTip.show();
								}
							} else {
								baseFn.toastTip.setText('请选择毕业时间');
								baseFn.toastTip.show();
							}
						} else {
							baseFn.toastTip.setText('请选择所学专业');
							baseFn.toastTip.show();
						}
					} else {
						baseFn.toastTip.setText('请选择毕业学校');
						baseFn.toastTip.show();
					}
				} else {
					baseFn.toastTip.setText('请选择最高学历');
					baseFn.toastTip.show();
				}
			},
			//验证成功之后的处理
			handleSubmitInfor: function(callback) {
				baseFn.pageHandleData(callback);
				window.location.href = 'jobInfor.html';
			}
		},
		//初始化事件处理
		initBindEvent: function() {
			graduateInfor.bindEvent.triggerSimpleSelect();
			graduateInfor.bindEvent.triggerSearchSelect();
			graduateInfor.bindEvent.clickNextBtn();
			baseFn.bindEvent.uploadImages(function($this, imageData) {
				baseFn.baseHandleFun.simpleUploadImageHandleFun($this, imageData, function(callback) {
					graduateInfor.handleFun.handleFinalImage(callback);
				});
			});
			baseFn.bindEvent.clickPrevBtn('personalInfor.html');
		},
		//初始化数据处理
		initData: function() {
			baseFn.getAllView();
			var inforData = baseFn.baseHandleFun.cloneObj(baseFn.allViewObj.candidate);
			template.helper('addBaseImageSrc', function(src) {
				return(baseFn.imgBaseSrc + src);
			});
			//清除图片默认路径
			var DEFAULTIMGURL = '/assets/candidate/af_at_pho.png';
			inforData['diploma_url'] === DEFAULTIMGURL ? inforData['diploma_url'] = '' : inforData['diploma_url'] = inforData['diploma_url'];
			var graduateHtml = template('graduateInfor-tpl', inforData);
			document.getElementById('graduateInfor-main-wrapper').innerHTML = graduateHtml;
			graduateInfor.diplomaImage = inforData.diploma_url;
		},
		//页面初始化
		init: function() {
			graduateInfor.initData();
			graduateInfor.initBindEvent();
		}
	}
	graduateInfor.init();
})