$(function() {
	var prove = {
		bindEvent: {
			inputFocus: function() {
				//						$('#prove-input').on('focus',function(){
				//							$('#yes-check').attr('checked',true);
				//						})
			},
			clickSaveBtn: function() {
				$('#save-btn').on('click', function() {
					//处理本页数据
					prove.handleFun.handleThisPage(function() {
						//loadding出现
						baseFn.loaddingDialogTip.show();
						//请求通知服务器
						var ajaxParam = prove.handleFun.handleSaveData();
						baseFn.setCommonAjax(baseFn.allViewUrl, ajaxParam, 'POST', false, null, function(callback) {
							console.log(callback);
							if(callback.status === 'success') {
								prove.handleFun.handleCallBackSucDataFun(callback);
								baseFn.loaddingDialogTip.hide();
								baseFn.setPromptMsg('信息保存成功,即将跳转预览页面');
								setTimeout(function() {
									window.location.href = 'allViewInfor.html';
								}, 2000)

							} else {
								baseFn.loaddingDialogTip.hide();
								baseFn.setPromptMsg(callback.msg || '服务器出现问题！');
							}

						}, function() {
							baseFn.loaddingDialogTip.hide();
							baseFn.setPromptMsg('服务器出现问题!');
						})
					});

				})
			}
		},
		handleFun: {
			//处理本页数据
			handleThisPage: function(fn) {
				//判断需不需要输入编码
				var isInputProve = $('input[type=radio]:checked').attr('data-type');
				var proveNum;
				if(!!isInputProve) {
					//验证字段是否为空
					proveNum = $('#prove-input').val();
					if(proveNum) {
						proveNum = proveNum;

					} else {
						baseFn.toastTip.setText('请填写辅助填表人编号');
						baseFn.toastTip.show();
						return false;
					}
				} else {
					proveNum = '';
				}
				baseFn.pageHandleData({
					sales: proveNum
				});
				fn && fn();

			},
			handleSaveData: function() {
				//数据处理成后台需要的格式;
				var paramData = baseFn.baseHandleFun.processParam(baseFn.allViewObj);
				$.extend(paramData, {
					view_button: 'save_button'
				});
				for(var i in paramData) {
					if(paramData[i] == null || paramData[i] == 'null') paramData[i] = '';
				};
				return paramData;
			},
			handleCallBackSucDataFun: function(callback) {
				console.log(callback);
				var paramdata = baseFn.baseHandleFun.processParam(callback.data)
				sessionStorage.setItem('paramData', JSON.stringify(paramdata));
				sessionStorage.setItem('allView', JSON.stringify(callback.data));
			}
		},
		initBindEvent: function() {
			baseFn.bindEvent.clickPrevBtn('workPerformance.html');
			prove.bindEvent.inputFocus();
			prove.bindEvent.clickSaveBtn();
		},
		initData: function() {
			baseFn.getAllView();
			var inforData = {
				prove: baseFn.allViewObj.candidate.sales
			};
			var graduateHtml = template('prove-tpl', inforData);
			document.getElementById('prove-main-wrapper').innerHTML = graduateHtml;
		},
		init: function() {
			prove.initData();
			prove.initBindEvent();
		}
	}
	prove.init();
})