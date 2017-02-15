$(function() {
	var noPay = {
		//改变用户状态的url
		changeStatusUrl: baseFn.baseUrl + 'againApply',
		//获取订单信息url
		getOrderInforUrl: baseFn.baseUrl + 'candidates/search_order',
		//订单信息
		orderInfor: {},
		bindEvent: {
			//点击返回修改按钮
			goBackAmend: function() {
				$('#change-status').on('click', function(e) {
					e.preventDefault();
					var paramdata = baseFn.baseHandleFun.processParam(baseFn.allViewObj);
					$.extend(paramdata, {
						view_button: 'modify_button'
					});
					baseFn.setCommonAjax(baseFn.allViewUrl, paramdata, 'POST', false, null, function(callback) {
						if(callback.status == 'success') {
							if(callback.data.ps.status === 'forming') {
								//更新全部数据外加请求参数
								sessionStorage.setItem('allView', JSON.stringify(callback.data));
								paramdata['updated_at'] = callback.data.candidate.updated_at;
								delete paramdata['star_id'];
								sessionStorage.setItem('paramData', JSON.stringify(paramdata));
								baseFn.setPromptMsg('修改成功，即将返回预览页面');
								setTimeout(function() {
									window.location.href = 'allViewInfor.html';
								}, 1500)
							} else {
								baseFn.setPromptMsg(callback.data.ps.err_msg || '数据提交失败')
							}
						}
					});
				})
			},
			//点击立即支付按钮
			goToPay: function() {
				$('#pay-btn').on('click', function(e) {
					e.preventDefault();
					window.location.href = 'payPage.html?pay_price=' + noPay.orderInfor['pay_plice'] + '&order_id=' + noPay.orderInfor['order_id'] + '';
				})
			}
		},

		handleFun: {
			//处理得到星级
			getStarLevelStr: function() {
				var NUMSTRARR = ['一星', '二星', '三星', '四星', '五星'],
					starLevel = baseFn.allViewObj['candidate']['star_id'],
					arr = starLevel.split('');
				return NUMSTRARR[(arr[0] - 1)] + arr[1].toUpperCase() + '级';
			},
			//获取费用信息
			getApplyPrice: function(fn) {
				var talent_id = baseFn.allViewObj.candidate.candidate_id;
				baseFn.setCommonAjax(noPay.getOrderInforUrl, {
					order_type: 'candidate',
					talent_id: talent_id
				}, "POST", false, null, function(callback) {
					noPay.orderInfor['order_id'] = callback.order_id;
					noPay.orderInfor['pay_plice'] = callback.pay_plice;
					fn && fn(callback);
				})
			},
		},
		initBindEvent: function() {
			noPay.bindEvent.goBackAmend();
			noPay.bindEvent.goToPay();
		},
		initData: function() {
			var inforData = {};
			//获取全部数据;
			baseFn.getAllView();
			inforData['name'] = baseFn.allViewObj['candidate']['talent_name'];
			inforData['starLevel'] = noPay.handleFun.getStarLevelStr();
			noPay.handleFun.getApplyPrice(function(callback) {
				inforData['price'] = callback.pay_plice;
				var noPayPageHtml = template('noPay-html', inforData);
				document.getElementById('noPay-page-wrapper').innerHTML = noPayPageHtml;
				noPay.initBindEvent();
			});
		},
		init: function() {
			noPay.initData()
		}
	}
	noPay.init();
})