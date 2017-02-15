$(function() {
	var workMances = {
		//请求类型地址
		getTypesUrl: baseFn.baseUrl + 'candidates/credentials_list',
		typeList: {
			cres: null,
			cases: null,
			papers: null
		},
		bindEvent: {
			triggerSimpleSelect: function() {
				$('.simple-select').off('click').on('click', function() {
					var selectType = $(this).attr('data-type');
					var listTypeArr, listStr = '';
					if(selectType === 'cre') {
						listTypeArr = workMances.typeList.cres;
					} else if(selectType === 'case') {
						listTypeArr = workMances.typeList.cases;
					} else {
						listTypeArr = workMances.typeList.papers;
					};
					for(var i = 0, len = listTypeArr.length; i < len; i++) {
						listStr += '<li><a data-id="' + listTypeArr[i].id + '" class="select-el" href="javascript:void(0)">' + listTypeArr[i].name + '</a></li>'
					}
					baseFn.initSelectDialog(listStr, $(this), baseFn.simpleDialogTip, $('#popup-box'), function($this, dataId) {
						$this.parents('.page-module-wrapper').attr('data-type', dataId)
					});
				})
			},
			addPageMain: function() {
				$('.add-upload-page-button').on('click', function() {
					var type = $(this).attr('data-type');
					var $prevModule = $(this).prev();
					if(!!$prevModule.attr('data-type') && !!$prevModule.attr('data-src')) {
						$(this).before($prevModule.clone(true));
						//信息重置
						var nowLastMain = $(this).prev();
						var pageModuleNum = nowLastMain.parent().find('.page-module-wrapper').length;
						nowLastMain.removeAttr('data-src')
							.removeAttr('data-type')
							.find('.simple-select')
							.removeAttr('value')
							.val('')
							.end()
							.find('.mage-src')
							.removeAttr('src')
							.addClass('transparent')
							.end()
							.find('.module-num')
							.text(workMances.handleFun.numToChinese(pageModuleNum));
						if(nowLastMain.find('.upload-page-word').length) nowLastMain.find('.upload-page-word').find('.word-text').text('点击上传').end().find('.word-delete-btn-wrapper').addClass('hide');
					} else {
						new Alert("请先完善最后一项信息<br>（包选择括类型和上传图片/word文件）", {
							title: '警告',
							isClickMaskHide: true
						}).show();
					}
					switch(type) {
						case 'cre':
						case 'paper':
							nowLastMain.find('.image-src').removeAttr('src').addClass('transparent');
							break;
						case 'case':
							nowLastMain.find('.word-text').removeAttr('href').prev().removeClass('hide');
							break;
					}
				})
			},
			//word上传
			uploadWordFile: function() {
				$('.upload-word-btn').on('change', function() {
					var file = this.files[0];
					var $this = $(this);
					workMances.handleFun.vFormWordFile(file, $this, function(file, $this) {
						var reader = new FileReader();
						reader.readAsDataURL(file);
						//开始读取数据
						reader.onloadstart = function() {
							baseFn.setPromptMsg('开始上传')
						};
						//读取完成，无论成功或者失败都会触发
						reader.Error = function() {
								baseFn.setPromptMsg('文件信息读取失败，请重新选择案例文件')
							}
							//读取成功时触发
						reader.onload = function() {
							$this.val('');
							console.log($this);
							baseFn.baseHandleFun.simpleUploadImageHandleFun($this, this.result, function(callback, $this) {
								console.log($this);
								workMances.handleFun.handleWordUpload(callback, $this)
							})
						};
					})
				})
			},
			//点击删除按钮
			clickDeleteBtn: function() {
				$('.delete-page-btn').on('click', function(e) {
					e.preventDefault();
					var $this = $(this);
					var $wrapper = $this.parents('.page-module-wrapper');
					var $artWrapper = $this.parents('.page-wrapper ');
					var pageModuleList = $artWrapper.find('.page-module-wrapper');
					if(pageModuleList.length === 1) {
						var popAlert = new Alert("唯一上传模块不能删除", {
							title: '警告'
						}).show();
						return false;
					}
					var popConfirm = new Alert("点击确定将会删除本项已经填写的所有信息", {
						"onClickOk": function(e) {
							$wrapper.remove();
							var nowPageModuleList = $artWrapper.find('.page-module-wrapper');
							for(var i = 1; i < (nowPageModuleList.length + 1); i++) {
								nowPageModuleList.find('.module-num').text(workMances.handleFun.numToChinese(i));
							}
							e.hide();
						},
						"onClickCancel": function(e) {
							e.hide();
						}
					}).show();
				})
			},
			clickNextBtn: function() {
				$('#next-btn').on('click', function() {
					var credentials, cases, papers;
					credentials = workMances.handleFun.handleAddInfors($('#cres-list').find('.page-module-wrapper'), 'cre');
					cases = workMances.handleFun.handleAddInfors($('#cases-list .page-module-wrapper'), 'case');
					papers = workMances.handleFun.handleAddInfors($('#papers-list .page-module-wrapper'), 'paper');
					workMances.handleFun.mergeDatas({
						credentials: credentials,
						cases : cases,
						papers : papers
					});
					window.location.href = 'provePerson.html';
				})
			},
		},
		//头部初始化
		fadeInHeader: function() {
			var time = setTimeout(function() {
				clearTimeout(time)
				$('#tip-header').fadeIn(1000);
			}, 2000)
		},
		handleFun: {
			//合并数据
			mergeDatas: function(obj) {
				$.extend(baseFn.allViewObj, obj);
				console.log(baseFn.allViewObj);
				sessionStorage.setItem('allView', JSON.stringify(baseFn.allViewObj));
			},
			//点击下一步按钮数据处理函数
			handleAddInfors: function(infors, type) {
				var results = [];
				for(var i = 0; i < infors.length; i++) {
					var infor = $(infors[i]);
					var url = infor.attr('data-src');
					var id = infor.attr('data-type');
					if(type === 'cre') {
						if(!!url && !!id) {
							results.push({
								cer_url: url,
								cer_id: id
							})
						}

					} else if(type === 'case') {
						if(!!url && !!id) {
							results.push({
								case_url: url,
								case_id: id
							})
						}
					} else {
						if(!!url && !!id) {
							results.push({
								papers_url: url,
								papers_id: id
							})
						}
					}
				}
				return results;
			},
			handleImageUpload: function($this, callback) {
				$this.parents('.page-module-wrapper').attr('data-src', callback.img_url);
			},
			//word文件上传公共之后的处理
			handleWordUpload: function(callback, $this) {
				$this.parents('.page-module-wrapper').attr('data-src', callback.img_url).end().next().text('上传成功').end().addClass('hide').parent().next().removeClass('hide').children('.word-delete-btn').attr('href', (baseFn.imgBaseSrc + callback.img_url))
			},
			//数字转中文
			numToChinese: function(num) {
				if(!/^\d*(\.\d*)?$/.test(num)) {
					alert("Number is wrong!");
					return "Number is wrong!";
				}
				var AA = new Array("零", "一", "二", "三", "四", "五", "六", "七", "八", "九");
				var BB = new Array("", "十", "百", "千", "万", "亿", "点", "");
				var a = ("" + num).replace(/(^0*)/g, "").split("."),
					k = 0,
					re = "";
				for(var i = a[0].length - 1; i >= 0; i--) {
					switch(k) {
						case 0:
							re = BB[7] + re;
							break;
						case 4:
							if(!new RegExp("0{4}\\d{" + (a[0].length - i - 1) + "}$").test(a[0]))
								re = BB[4] + re;
							break;
						case 8:
							re = BB[5] + re;
							BB[7] = BB[5];
							k = 0;
							break;
					}
					if(k % 4 == 2 && a[0].charAt(i + 2) != 0 && a[0].charAt(i + 1) == 0) re = AA[0] + re;
					if(a[0].charAt(i) != 0)
						re = AA[a[0].charAt(i)] + BB[k % 4] + re;
					k++;
				}
				if(a.length > 1) {
					re += BB[6];
					for(var i = 0; i < a[1].length; i++) {
						re += AA[a[1].charAt(i)]
					};
				}
				return re;
			},
			//验证word文件
			vFormWordFile: function(file, $this, fn) {
				var size = file.size / 1024 / 1024,
					fileType = file.name.toLocaleLowerCase().split('.');
				fileType = fileType[fileType.length - 1];
				//判断文件类型
				if(baseFn.allowWordType.indexOf(fileType) === -1) {
					new Alert('请上传指定格式的word文件！<br>(暂仅支持doc/docx类型的word文件)', {
						title: '警告'
					}).show();
					$this.val('');
					return false;
				} else if(size > 5) {
					new Alert('文件体积过大，请重新上传！', {
						title: '警告'
					}).show();
					$this.val('');
					return false;
				} else {
					fn && fn(file, $this);
				};
			},
			//类型数据初始化
			initTypesData: function(fn) {
				//首先获得证书类型数组
				var CRETYPE = 'credent';
				workMances.handleFun.getTypesFun(CRETYPE, function(callback) {
					console.log(callback);
					if(callback.status === 'success') {
						workMances.typeList.cres = callback.data;
						//案例类型数组
						var CASETYPE = 'case';
						workMances.handleFun.getTypesFun(CASETYPE, function(callback) {
							if(callback.status === 'success') {
								workMances.typeList.cases = callback.data;
								//文献类型数组
								var PAPERTYPE = 'paper';
								workMances.handleFun.getTypesFun(PAPERTYPE, function(callback) {
									if(callback.status === 'success') {
										workMances.typeList.papers = callback.data;
										fn && fn();
									} else {
										baseFn.toastTip.setText('服务出现问题，请稍后重试');
										baseFn.toastTip.show();
									}

								})
							} else {
								baseFn.toastTip.setText('服务出现问题，请稍后重试');
								baseFn.toastTip.show();
							}
						})
					} else {
						baseFn.toastTip.setText('服务器出现问题，请稍后重试');
						baseFn.toastTip.show();
					}
				})
			},
			//获取类型数组
			getTypesFun: function(type, fn) {
				baseFn.setCommonAjax(workMances.getTypesUrl, {
					type:
					type
				}, 'POST', false, null, function(callback) {
					fn && fn(callback);
				})
			}
		},
		//初始化事件处理
		initBindEvent: function() {
			baseFn.bindEvent.uploadImages(function($this, imageData) {
				baseFn.baseHandleFun.simpleUploadImageHandleFun($this, imageData, function(callback) {
					workMances.handleFun.handleImageUpload($this, callback);
				});
			});
			workMances.bindEvent.triggerSimpleSelect();
			workMances.bindEvent.addPageMain();
			workMances.bindEvent.clickDeleteBtn();
			baseFn.bindEvent.clickPrevBtn('jobInfor.html');
			workMances.bindEvent.clickNextBtn();
			workMances.bindEvent.uploadWordFile();
		},
		//初始化数据处理
		initData: function() {
			baseFn.getAllView();
			var inforData = {};
			inforData['credentials'] = baseFn.allViewObj.credentials;
			inforData['cases'] = baseFn.allViewObj.cases;
			inforData['papers'] = baseFn.allViewObj.papers;
			template.helper('numToChinese', function(num) {
				return workMances.handleFun.numToChinese(num);
			});
			template.helper('addBaseImageSrc', function(src) {
				return(baseFn.imgBaseSrc + src);
			});
			workMances.handleFun.initTypesData(function() {
				template.helper('resetTypeName', function(i, type) {
					var typeName;
					if(type === 'cre') {
						typeName = workMances.typeList.cres[(--i)].name;
					} else if(type === 'case') {
						typeName = workMances.typeList.cases[(--i)].name;
					} else {
						typeName = workMances.typeList.papers[(--i)].name;
					}
					console.log(typeName)
					return typeName;
				});
				var graduateHtml = template('workMance-tpl', inforData);
				document.getElementById('workMance-main-wrapper').innerHTML = graduateHtml;
				workMances.initBindEvent();
			})

		},
		//页面初始化
		init: function() {
			workMances.initData();
			workMances.fadeInHeader();
		}
	}
	workMances.init();
})