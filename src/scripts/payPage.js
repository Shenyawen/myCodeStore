$(function() {
	var payPage = {
		//支付路径
		payUrl: baseFn.baseUrl + 'candidates/pay',
		dataResults: baseFn.getRequest(),
		bindEvent: {
			//点击立即支付按钮
			clickPayBtn: function() {
				$('#pay-btn').on('click', function() {
					var $result = payPage.dataResults,
						$this = $(this),
						dataObj = {
							orderId: $result.order_id,
						};
					$this.attr('disabled', true);
					baseFn.setCommonAjax(payPage.payUrl, dataObj, 'POST', false, null, function(callback) {
						console.log(callback);
						pingpp.createPayment(callback, function(result, err) {
							if(result === "success") {
								baseFn.setPromptMsg('支付成功，即将跳转...');
								setTimeout(function() {
									window.location.href = 'myEvaluate.html';
								}, 1500);
							} else if(result === "fail") {
								baseFn.setPromptMsg('支付失败，请稍候重试');
								$this.removeAttr('disabled');
							} else if(result === "cancel") {
								baseFn.setPromptMsg('支付取消，请重新支付');
								$this.removeAttr('disabled');
							};
						});
					}, function() {
						baseFn.setPromptMsg('网络出现问题，支付失败，请稍候重试');
						$this.removeAttr('disabled');
					});
				});
			},
		},
		initBindEvent: function() {
			payPage.bindEvent.clickPayBtn();
		},
		initData: function() {
			var inforData = {
				price: payPage.dataResults.pay_price
			};
			var payPageHtml = template('payPage-tpl', inforData);
			document.getElementById('page-wrapper').innerHTML = payPageHtml;
		},
		init: function() {
			payPage.initData();
			payPage.initBindEvent();
		}
	};
	payPage.init();
})