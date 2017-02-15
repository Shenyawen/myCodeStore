$(function() {
	var allViewObj = {
		//请求类型地址
		getTypesUrl: baseFn.baseUrl + 'candidates/credentials_list',
		//获取机构地址
		getAgencyUrl: baseFn.baseUrl + 'candidates/search_agency',
		//获取机构人才地址
		getTalentUrl: baseFn.baseUrl + 'candidates/experts_find_name',
		//获取订单号地址
		getOrderIdUrl: baseFn.baseUrl + 'candidates/search_order',
		typeList: {
			cres: null,
			cases: null,
			papers: null
		},
		judeStarInfor: null,
		imageDialog: new Dialog("#image-dialog-pop", {
			position: "middle"
		}),
		judeStarDialog: new Dialog("#jude-star-pop", {
			position: "middle"
		}),
		organizationDialog: new Dialog("#organization-pop", {
			position: "middle"
		}),
		loaddingDialog: new Dialog('#loadding-active-pop'),
		bindEvent: {
			// 点击图片预览
			clickPreviewImage: function() {
				allViewObj.imageDialog.setOnClick(function(e) {
					e.hide();
				});
				$('img').on('click', function() {
					var imageSrc = $(this).attr('src');
					$('#image-dialog-pop img').attr('src', imageSrc);
					allViewObj.imageDialog.show();
				})
			},
			// 点击编辑按钮
			clickResetBtn: function() {
				$('.reset-infor-btn').on('click', function(e) {
					e.preventDefault();
					var toHref = $(this).attr('href');
					var paramdata = allViewObj.handleFun.processJudeParamData();;
					paramdata['view_button'] = 'modify_button';
					baseFn.setCommonAjax(baseFn.allViewUrl, paramdata, 'POST', false, null, function(callback) {
						if(callback.status === 'success') {
							if(callback.data.ps.status === 'forming') {
								baseFn.setPromptMsg('状态修改成功，即将跳转页面');
								setTimeout(function() {
									window.location.href = toHref;
								}, 1500);
							} else {
								baseFn.setPromptMsg(callback.data.ps.err_msg);
							}
						} else {
							baseFn.setPromptMsg('网络出现问题，请稍候重试！');
						}
					});
				})
			},
			// 点击预览星际预览
			clickJudeStarBtn: function() {
				$('#jude-star-btn').on('click', function() {
					if(!!allViewObj.judeStarInfor) {
						allViewObj.handleFun.judeStarCallbackFun(allViewObj.judeStarInfor);
					} else {
						allViewObj.handleFun.handleFirstClickJudeBtn();
					}

				})
			},
			//点击按钮关闭星级预判弹出框
			clickCloseJudeStarDialog: function() {
				$('.close-star-dialog').off('click').on('click', function() {
					allViewObj.judeStarDialog.hide();
				})
			},
			//点击提交按钮
			clickSubmitApplyBtn: function() {
				$('#submit-apply-btn').on('click', function() {

					var isHasOrder = baseFn.allViewObj.ps.has_order;
					if(isHasOrder && isHasOrder === true) { // 有订单号
						allViewObj.handleFun.handleHasOrderFun(function(paramdata) {
							allViewObj.handleFun.handleFinalSubmitFun(function(talentId) {
								allViewObj.handleFun.getOrderHandle(talentId); // 获取订单号并跳转
							});
						});
					} else { // 无订单号
						allViewObj.handleFun.handleNoOrderFun(function(paramdata) {
							// 获取评价机构；
							allViewObj.handleFun.getEvaluateOrganization(paramdata, function() {
								// 点击评价机构；
								allViewObj.handleFun.clickOrganizationBtn(function(paramdata) {
									// 获取机构专家；
									allViewObj.handleFun.getOrganizationExpert(paramdata, function(paramId) {
										// 绑定返回按钮事件；
										allViewObj.handleFun.handleBackBtnFun();

										// 点击机构专家框确定按钮;
										allViewObj.handleFun.clickExportsConfirmBtn(paramId, function(paramdata) {
											// 点击机构专家框确定按钮事件处理
											allViewObj.handleFun.handleFinalSubmitFun(paramdata, function(talentId) {
												// 获取订单号并跳转
												allViewObj.handleFun.getOrderHandle(talentId);
											});
										});
									});
								});
							});
						});
					}
				})
			},

		},
		handleFun: {
			// 有订单号参数处理;
			handleHasOrderFun: function(fn) {
				var paramdata = JSON.parse(sessionStorage.getItem('paramData'));
				delete paramdata["agency_id_s"];
				delete paramdata["expert_id_s"];
				fn && fn(paramdata);
			},
			// 无订单号参数处理;
			handleNoOrderFun: function(fn) {
				var nowYear = new Date().getFullYear();
				var paramdata = {
					edu_id: baseFn.allViewObj.candidate.edu_id,
					organization_id: baseFn.allViewObj.candidate.organization_id,
					talent_id: baseFn.allViewObj.candidate.candidate_id,
					isequal: baseFn.allViewObj.candidate.unm_year == nowYear ? true : false,
					sales: baseFn.allViewObj.candidate.sales
				};
				fn && fn(paramdata);
			},
			//获取评价机构
			getEvaluateOrganization: function(paramdata, fn) {
				baseFn.setCommonAjax(allViewObj.getAgencyUrl, paramdata, 'POST', false, null, function(callback) {
					var organizationStr = '';
					for(var i = 0; i < callback.length; i++) {
						organizationStr += '<li class="select-btn" data-id="' + callback[i].agency_id + '">' + callback[i].agency_name + '</li>';
					}
					var $organizationPop = $('#organization-pop');
					var $organizationWrapper = $organizationPop.find('.organizations-wrapper');
					//弹出框初始化
					if($organizationWrapper.hasClass('hide')) $organizationWrapper.removeClass('hide').next().addClass('hide');
					$organizationPop.find('.organizations-wrapper .select-wrapper').html(organizationStr);
					allViewObj.organizationDialog.show();
					fn && fn();
				})
			},

			// 选择机构事件处理；
			clickOrganizationBtn: function(fn) {
				$('#organization-pop li.select-btn').off('click').on('click', function() {
					var organizationId = $(this).attr('data-id');
					var paramdata = {
						agency_id: organizationId
					};
					fn && fn(paramdata);
				})
			},

			// 获取专家列表；
			getOrganizationExpert: function(paramdata, fn) {
				baseFn.setCommonAjax(allViewObj.getTalentUrl, paramdata, 'POST', false, null, function(callback) {
					var exportsStr = '';
					for(var i = 0; i < callback.length; i++) {
						exportsStr += '<label class="inputbox export-flex">' +
							'<input data-id="' + callback[i].expert_id + '" type="checkbox" class="input-checkbox">' +
							'<span>' + callback[i].expert_name + '</span>' +
							'</label>';
					};
					$('#organization-pop .exports-wrapper').removeClass('hide').prev().addClass('hide').end().find('.select-wrapper').html(exportsStr);
					//点击返回按钮
					fn && fn(paramdata.agency_id);
				})
			},
			// 点击专家弹出框的确定按钮事件处理;
			clickExportsConfirmBtn: function(paramId, fn) {
				$('.exports-confirm-btn').off('click').on('click', function() {
					var $exportsWrapper = $('#organization-pop').find('.exports-wrapper .select-wrapper');
					// 获取选中的专家数量;
					var MAXSELECTNUM = 2;
					var $selects = $exportsWrapper.find(':checked');
					var selectLength = $selects.length;
					if(selectLength === MAXSELECTNUM) {
						var exportIds = [];
						$selects.each(function(index) {
							exportIds[index] = $(this).attr('data-id');
						});
						var paramdata = {
							agency_id_s: paramId,
							expert_id_s: exportIds.join('_')
						};
						paramdata = $.extend(paramdata, JSON.parse(sessionStorage.getItem('paramData')));
						delete paramdata['star_id'];
						allViewObj.organizationDialog.hide();
						fn && fn(paramdata);
					} else {
						baseFn.toastTip.setText('必须且只能选择两位专家');
						baseFn.toastTip.show();
					}
				})
			},
			// 点击专家框返回按钮;
			handleBackBtnFun: function() {
				$('.get-back-btn').off('click').on('click', function() {
					$('#organization-pop .exports-wrapper').addClass('hide').prev().removeClass('hide');
				})
			},
			// 最终点击提交申请处理函数;
			handleFinalSubmitFun: function(paramdata, fn) {
				allViewObj.loaddingDialog.show();
				paramdata['view_button'] = 'submit_button';
				baseFn.setCommonAjax(baseFn.allViewUrl, paramdata, 'POST', false, null, function(callback) {
					if(callback.status === 'success') {
						if(callback.data.ps.status === 'init_submit') {
							if(callback.data.candidate.is_free === 'no') {
								var talentId = callback.data.candidate.candidate_id;
								fn && fn(talentId);
							} else {
								allViewObj.loaddingDialog.hide();
								baseFn.setPromptMsg('处理成功，即将前往支付');
								setTimeout(function() {
									window.location.href = 'myEvaluate.html';
								}, 2000);
							}
						} else if(callback.data.ps.status === 'init_paid') {
							allViewObj.loaddingDialog.hide();
							baseFn.setPromptMsg('处理成功，即将跳转我的评价');
							setTimeout(function() {
								window.location.href = 'myEvaluate.html';
							}, 2000);
						} else {
							allViewObj.loaddingDialog.hide();
							baseFn.setPromptMsg(callback.data.ps.err_msg);
						}
					} else {
						allViewObj.loaddingDialog.hide();
						baseFn.setPromptMsg(callback.msg || '服务器报错！')
					}
				});
			},
			// 请求获取订单号;
			getOrderHandle: function(talentId) {
				baseFn.setCommonAjax(allViewObj.getOrderIdUrl, {
					order_type: 'candidate',
					talent_id: talentId
				}, "POST", false, null, function(callback) {
					allViewObj.loaddingDialog.hide();
					baseFn.setPromptMsg('处理成功，即将跳转...');
					setTimeout(function() {
						window.location.href = 'payPage.html?order_id=' + callback.order_id + '&pay_price=' + callback.pay_plice + '';
					}, 1500);
				})
			},
			// 首次点击星级预判的处理的函数(ajax请求);
			handleFirstClickJudeBtn: function() {
				var paramData = allViewObj.handleFun.processJudeParamData();
				paramData['view_button'] = 'caculate_star_button';
				baseFn.setCommonAjax(baseFn.allViewUrl, paramData, 'POST', false, null, function(callback) {
					if(callback.status === 'success') {
						console.log(callback);
						var starLevel = callback.data.candidate.star_id;
						// 将获取到的星级资料保存在本地(避免二次请求);
						allViewObj.judeStarInfor = starLevel;
						// 输入星级参数;
						allViewObj.handleFun.judeStarCallbackFun(starLevel);
						// 修改参数对象中的最新时间 updata_at;
						paramData['updated_at'] = callback.data.candidate.updated_at;
						delete paramData['star_id'];
						sessionStorage.setItem('paramData', JSON.stringify(paramData));
					} else {
						baseFn.toastTip.setText(callback.data.ps.err_msg || '服务出现故障，请稍后重试');
						baseFn.toastTip.show();

					}
				}, function() {
					baseFn.setPromptMsg('请检查您的网络设置');
				})
			},
			// 星际预判请求成功之后处理函数;
			judeStarCallbackFun: function(statLevel) {
				var starInforStr = allViewObj.handleFun.handleStarLevelParam(statLevel);
				$('#jude-star-pop').find('.star-infors').html(starInforStr);
				allViewObj.judeStarDialog.show();
				$('#jude-star-btn').addClass('white-btn').next().removeClass('hide');
			},
			// 处理回调参数，并生成想要的domStr;
			handleStarLevelParam: function(starparam) {
				var starListStr = '';
				var starLevelInfors = starparam.split('');
				var starNum = starLevelInfors[0];
				var starLevel = starLevelInfors[1];
				var MAXSTARNUM = 5; // 最大星级是五颗星;
				for(var i = 0; i < MAXSTARNUM; i++) {
					if(i < starNum) {
						starListStr += '<li class="star-active"></li>';
					} else {
						starListStr += '<li class="star-default"></li>';
					}
				}
				var CHINESESTARINFORS = ['一星', '二星', '三星', '四星', '五星'];
				return '<ul class="star-icons">' + starListStr + '</ul><br><p class="star-level-infor">' + CHINESESTARINFORS[(starNum - 1)] + starLevel.toUpperCase() + '级</p>';
			},
			// 求参数处理;
			processJudeParamData: function() {
				var paramdata = JSON.parse(sessionStorage.getItem('paramData'));
				if(!!paramdata) {
					paramdata = paramdata;
				} else {
					paramdata = baseFn.baseHandleFun.processParam(baseFn.allViewObj);
				}
				delete paramdata['star_id'];
				return paramdata;
			},
			// 类型数据初始化;
			initTypesData: function(fn) {
				// 首先获得证书类型数组;
				var CRETYPE = 'credent';
				allViewObj.handleFun.getTypesFun(CRETYPE, function(callback) {
					if(callback.status === 'success') {
						allViewObj.typeList.cres = callback.data;
						// 案例类型数组;
						var CASETYPE = 'case';
						allViewObj.handleFun.getTypesFun(CASETYPE, function(callback) {
							if(callback.status === 'success') {
								allViewObj.typeList.cases = callback.data;
								// 文献类型数组;
								var PAPERTYPE = 'paper';
								allViewObj.handleFun.getTypesFun(PAPERTYPE, function(callback) {
									if(callback.status === 'success') {
										allViewObj.typeList.papers = callback.data;
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
			// 获取类型数组;
			getTypesFun: function(type, fn) {
				baseFn.setCommonAjax(allViewObj.getTypesUrl, {
					type:
					type
				}, 'POST', false, null, function(callback) {
					fn && fn(callback);
				})
			}
		},
		// 初始化事件处理;
		initBindEvent: function() {
			allViewObj.bindEvent.clickPreviewImage();
			allViewObj.bindEvent.clickResetBtn();
			allViewObj.bindEvent.clickJudeStarBtn();
			allViewObj.bindEvent.clickCloseJudeStarDialog();
			allViewObj.bindEvent.clickSubmitApplyBtn();
		},
		// 初始化数据处理;
		initData: function() {
			baseFn.getAllView();
			var inforData = baseFn.baseHandleFun.cloneObj(baseFn.allViewObj.candidate);
			inforData['credentials'] = baseFn.baseHandleFun.cloneObj(baseFn.allViewObj.credentials);
			inforData['cases'] = baseFn.baseHandleFun.cloneObj(baseFn.allViewObj.cases);
			inforData['papers'] = baseFn.baseHandleFun.cloneObj(baseFn.allViewObj.papers);
			inforData['cresLength'] = baseFn.allViewObj.credentials.length;
			inforData['casesLength'] = baseFn.allViewObj.cases.length;
			inforData['papersLength'] = baseFn.allViewObj.papers.length;
			template.helper('addBaseImageSrc', function(src) {
				return(baseFn.imgBaseSrc + src);
			});
			allViewObj.handleFun.initTypesData(function() {
				template.helper('resetTypeName', function(i, type) {
					var typeName;
					if(type === 'cre') {
						typeName = allViewObj.typeList.cres[(--i)].name;
					} else if(type === 'case') {
						typeName = allViewObj.typeList.cases[(--i)].name;
					} else {
						typeName = allViewObj.typeList.papers[(--i)].name;
					}
					return typeName;
				});
				var allViewHtml = template('allview-tpl', inforData);
				document.getElementById('allview-main-wrapper').innerHTML = allViewHtml;
				allViewObj.initBindEvent();
			})
		},
		// 页面初始化;
		init: function() {
			allViewObj.initData();
		}
	}
	allViewObj.init();
})