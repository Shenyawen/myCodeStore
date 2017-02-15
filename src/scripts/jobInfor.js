$(function() {
	var jobInfor = {
		searchOrganizationUrl: baseFn.baseUrl + 'candidates/search_organization',
		jobImage: null,
		bindEvent: {
			//初始化一般选择器
			triggerSimpleSelect: function() {
				$('.simple-select').on('click', function() {
					var MAXNUM = 61;
					var listStr = '';
					var selectType = $(this).attr('data-type');
					var jobs = ['出纳', '非高管财务相关岗位', '公司财务副总', '总会计师', '财务总监', '副总经理', '总经理(有财务管理背景)', '董事长(有财务管理背景)']
					if(selectType === 'jobYears') {
						for(var i = 0; i < MAXNUM; i++) {
							listStr += '<li><a class="select-el" href="javascript:void(0)">' + i + '</a></li>'
						}
					} else {
						for(var i = 0; i < jobs.length; i++) {
							listStr += '<li><a class="select-el" href="javascript:void(0)">' + jobs[i] + '</a></li>'
						}
					}
					baseFn.initSelectDialog(listStr, $(this), baseFn.simpleDialogTip, $('#popup-box'));
				})
			},
			//初始化查询选择器
			triggerSearchSelect: function() {
				$('.search-select').off('click').on('click', function() {
					var searchType = $(this).attr('data-type');
					$('.select-wrapper').html('');
					$('.search-input').val('');
					baseFn.searchDialogTip.show();
					//第一次填充信息
					baseFn.baseHandleFun.searchInfor(jobInfor.searchOrganizationUrl, {
						query_name: ''
					}, searchType, $(this), function(listStr, $this) {
						baseFn.initSelectDialog(listStr, $this, baseFn.searchDialogTip, $('#ative-popup-box'));
					})
					baseFn.bindEvent.inputSearch(jobInfor.searchOrganizationUrl, searchType, $(this), function(listStr, $this) {
						baseFn.initSelectDialog(listStr, $this, baseFn.searchDialogTip, $('#ative-popup-box'));
					})
				})
			},
			clickNextBtn: function() {
				$('#next-btn').on('click', function() {
					jobInfor.handleFun.handleSubmitInfor();
				})
			}
		},
		handleFun: {
			handleFinalImage: function(callback) {
				jobInfor.jobImage = callback.img_url;
			},
			handleSubmitInfor: function() {
				var organizationInfor = $('#organization-infor').val();
				var organizationId = $('#organization-infor').attr('data-id');
				var jobYears = $('#job-years').val();
				var experienceYears = $('#experience-years').val();
				var postInfor = $('#post-infor').val();
				var callback = {
					organization: organizationInfor,
					organization_id: organizationId,
					experience: jobYears,
					experience2: experienceYears,
					job_post: postInfor,
					contribution_url1: jobInfor.jobImage
				}
				baseFn.pageHandleData(callback);
				window.location.href = 'workPerformance.html';
			},
		},
		//初始化事件处理
		initBindEvent: function() {
			jobInfor.bindEvent.triggerSimpleSelect();
			baseFn.bindEvent.uploadImages(function($this, imageData) {
				baseFn.baseHandleFun.simpleUploadImageHandleFun($this, imageData, function(callback) {
					jobInfor.handleFun.handleFinalImage(callback);
				});
			});
			jobInfor.bindEvent.triggerSearchSelect();
			baseFn.bindEvent.clickPrevBtn('graduateInfor.html');
			jobInfor.bindEvent.clickNextBtn();
		},
		//初始化数据处理
		initData: function() {
			baseFn.getAllView();
			var inforData = baseFn.baseHandleFun.cloneObj(baseFn.allViewObj.candidate);
			if(inforData['contribution_url1'] === '/assets/candidate/af_at_pho.png') inforData['contribution_url1'] = '';
			template.helper('addBaseImageSrc', function(src) {
				return(baseFn.imgBaseSrc + src);
			});
			var graduateHtml = template('jobInfor-tpl', inforData);
			document.getElementById('graduateInfor-main-wrapper').innerHTML = graduateHtml;
		},
		//页面初始化
		init: function() {
			jobInfor.initData();
			jobInfor.initBindEvent();
		}
	}
	jobInfor.init();
})