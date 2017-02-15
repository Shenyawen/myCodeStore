var baseUrl = 'http://192.168.1.96:4000';
//var baseUrl = '';
var baseFn = {
	baseUrl : ''+baseUrl+'/api/',
	//用户状态的url
	userStatusUrl : ''+baseUrl+'/api/getStageId',
	//全部信息的url
	allViewUrl : ''+baseUrl+'/api/candidates/candidate',
	//查看用户申请星级url
	starJudeUrl: ''+baseUrl+'/api/proStar',
	//图片上传地址
	imgBaseUrl : ''+baseUrl+'/api/candidates/upload_image',
	//图片引用地址
	imgBaseSrc : ''+baseUrl+'',
	//可上传图片类型
	allowImgType : ['jpg','png','jpeg','bmp'],
	//可上传的word类型
	allowWordType : ['doc','docx'],
	//全部数据
	allViewObj : null,
	//提示组件
	toastTip : new Toast(''),
	//loadding弹出框
	loaddingDialogTip: new Dialog("#loadding-pop",{position:"middle",isClickMaskHide:false}),
	//普通弹出框
	simpleDialogTip: new Dialog("#popup-box",{position:"middle"}),
	//查询弹出框
	searchDialogTip: new Dialog("#ative-popup-box",{position:"middle",isClickMaskHide:true}),
	//prompt提示框
	promptTip: prompt = new Prompt(),
	//ajax公用函数(包括jsonp);
	setCommonAjax : function(url,data,type,isCross,beforeFn,sucFn,errFn){
		$.ajax({
			type:type,
			url:url,
			async:true,
			data:data,
			dataType:isCross?'jsonp':'',
			jsonp: 'callback',
			timeout : 20000,
			beforeSend:function(XMLHttpRequest){
				beforeFn && beforeFn();
			},
			success:function(data){
				sucFn && sucFn(data);
			},
			error:function(XMLHttpRequest, textStatus, errorThrown){
				errFn && errFn(XMLHttpRequest, textStatus, errorThrown);
			}
		});
	},
	//prompt提示框设置
	setPromptMsg: function(msg,fn){
		var prompt = baseFn.promptTip;
		prompt.setText(msg);
		prompt.show();
		setTimeout(function(){
			prompt.hide();
			fn && fn();
		},1500);
	},
	//图片上传验证
	vImageUpload: function(file,that,fn){
		var size = file.size/1024/1024,
			fileType = file.name.toLocaleLowerCase().split('.');
		fileType = 	fileType[fileType.length - 1];
		//判断文件类型
		if(baseFn.allowImgType.indexOf(fileType) === -1){
			new Alert('请上传指定格式的图片文件！<br>(暂仅支持jpg/png/bmp类型的图片文件)',{
				title:'警告'
			}).show();
			that.value = '';
			return false;
		}else if( size > 5 ){
			new Alert('图片体积过大，请重新选择图片！',{
				title:'警告'
			}).show();
			that.value = '';
			return false;
		}else{
			fn && fn();
		};
	},
	//每页提交之前的数据处理
	pageHandleData: function(obj){
		$.extend(baseFn.allViewObj.candidate, obj);
		sessionStorage.setItem('allView', JSON.stringify(baseFn.allViewObj));
		console.log(baseFn.allViewObj);
	},
	//表单验证;
	validateForm : {
		//验证手机号;
		testTel : function(telNum){
			var reg = /^1[3|4|5|7|8]\d{9}$/;
			return reg.test(telNum);
		},
		//验证身份证号码;
		testDentityCard : function(proofNum){
			var reg = /^[1-9]{1}[0-9]{14}$|^[1-9]{1}[0-9]{16}([0-9]|[xX])$/;
			return reg.test(proofNum);
		},
		//验证密码格式
		testPwdCode : function(pwd){
			var reg = /^[a-zA-Z]{1}([a-zA-Z0-9]|[._]){5,15}$/;
			return reg.test(pwd);
		},
		testEmail : function(emailNum){
			var reg = /^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/;
			return reg.test(emailNum);
		}
	},
	//lock锁(减少查询次数，减轻服务器压力);
	timeTask : function(key, fun, defer){
		var me = arguments.callee,
            k = key,
            cache = me.$cache || (me.$cache = {});
        if (cache[k]){
            clearTimeout(cache[k]);
        }
        if (typeof fun == 'function')
            cache[k] = setTimeout(function(){
                delete cache[k];
                fun.apply(null, [])
            }, defer || 0);
        else delete cache[k];
	},
	bindEvent : {
		//输入查询
		inputSearch : function(url,type,$this,sucFn){
			$('.search-input').off('input').on('input',function(){
				var dataObj = {query_name : $(this).val()};
				baseFn.timeTask('search',function(){
					baseFn.baseHandleFun.searchInfor(url,dataObj,type,$this,function(listStr,$this){
						sucFn && sucFn(listStr,$this)
					})
				},500)
			})
		},
		//图片上传;
		uploadImages : function(fn){
			$('.input-file').off('change').on('change',function(){
				var file = this.files[0],
					that = this;
				var $this = $(this);
				//验证图片类型大小
				baseFn.vImageUpload(file,that,function(){
					baseFn.setPromptMsg('开始上传')
					$(that).siblings('.loadingBox').removeClass('hide');
					lrz(file).then(function (rst) {
			            //图片处理成功之后调用
						fn&&fn($this,rst.base64);
			        }).catch(function (err) {
						console.log(err);
			            // 处理失败会执行
						baseFn.setPromptMsg('文件信息读取失败,请重新选择!');
						$(that).siblings('.loadingBox').addClass('hide');
			        }).always(function () {
			            // 不管是成功失败，都会执行
						that.value = '';
			        });
				});
			})
		},
		//每页的点击上一步事件
		clickPrevBtn: function(url){
			$('#prev-btn').on('click',function(){
				new Alert("返回上一步将会丢失本页更改的信息",{
				  	"onClickOk":function(e){
				    	window.location.href = url;
				  	},"onClickCancel":function(e){
				    	e.hide();
				  	}
				}).show();
			})
		}
	},
	//处理函数
	baseHandleFun: {
		simpleUploadImageHandleFun: function($this,imageData,sucFun){
			var dataObj = {imageStr: imageData,base: 'client'};
			baseFn.setCommonAjax(baseFn.imgBaseUrl, dataObj, 'POST', false,null,function(data){
				if(data.msg === 'ok'){
					baseFn.setPromptMsg('上传成功');
					if(!!$this.siblings('.loadingBox').length) $this.siblings('.loadingBox').addClass('hide');
					if(!!$this.siblings('.image-src').length) $this.siblings('.image-src').attr('src',imageData).removeClass('transparent');
					sucFun && sucFun(data,$this)
				}else{
					baseFn.setPromptMsg(data.msg);
					if(!!$this.siblings('.loadingBox').length) $this.siblings('.loadingBox').addClass('hide');
					if(!!$this.siblings('.image-src').length) $this.siblings('.image-src').removeAttr('src').addClass('transparent');
				}
			},function(){
				baseFn.setPromptMsg('服务器出现未知问题,上传失败!');
				if(!!$this.siblings('.loadingBox').length) $this.siblings('.loadingBox').addClass('hide');
				if(!!$this.siblings('.image-src').length) $this.siblings('.image-src').removeAttr('src').addClass('transparent');
			})
		},
		cloneObj : function(myObj){
			if(typeof(myObj) != 'object') return myObj;  
			if(myObj == null) return myObj;  
			var myNewObj = new Object();  
			for(var i in myObj)  
			myNewObj[i] = baseFn.baseHandleFun.cloneObj(myObj[i]);  
			return myNewObj;  
		},
		//查询信息
		searchInfor: function(url,dataObj,type,$this,sucFn){
			baseFn.setCommonAjax(url,dataObj,'POST',false,null,function(callback){
				var listStr = idName = inforName = '';
				if(type === 'school'){
					idName = 'edu_id';
					inforName = 'edu_name';
				}else if(type === 'major'){
					idName = 'major_id';
					inforName = 'major_name';
				}else{
					idName = 'organization_id';
					inforName = 'organization';
				}
				for(var i=0; i< callback.data.length; i++){
					listStr += '<li><a class="select-el" data-id="'+callback.data[i][idName]+'" href="javascript:void(0)">'+callback.data[i][inforName]+'</a></li>';
				}
				if(!callback.data.length){
					listStr = '<li><a class="select-el" href="javascript:void(0)" data-id="0">'+dataObj.query_name+'</a></li>'
				}
				sucFn && sucFn(listStr,$this);
			})
		},
		//处理参数
		processParam : function(obj){
			var talent_id = obj.candidate.candidate_id,
				dataObj = {};
			for(var i in obj){
				if(i == 'cases'){
					for(var k = 0 ; k < (len = obj.cases.length);k++){
						if(obj[i][k]){
							obj[i][k]['talent_id'] = talent_id;
						}
						dataObj['cases_'+k+''] = obj[i][k];
					};
				}else if(i == 'credentials'){
					for(var k = 0 ; k < (len = baseFn.allViewObj.credentials.length);k++){
						if(obj[i][k]){
							obj[i][k]['talent_id'] = talent_id;
						}
						dataObj['credentials_'+k+''] = obj[i][k];
					};
				}else if(i == 'papers'){
					for(var k = 0 ; k < (len = baseFn.allViewObj.papers.length);k++){
						if(obj[i][k]){
							obj[i][k]['talent_id'] = talent_id;
						}
						dataObj['papers_'+k+''] = obj[i][k];
					};
				}
			}
			$.extend(dataObj,obj.candidate);
			sessionStorage.setItem('paramData',JSON.stringify(dataObj));
			return dataObj;
		},
	},
	//初始化弹出选择框选项内容
	initSelectDialog: function(listStr,$this,dialog,$wrapper,fn){
		var $slectWrapper = $wrapper.find('.select-wrapper');
		$slectWrapper.html('');
		$slectWrapper.html(listStr);
		dialog.show();
		$wrapper.find('.select-el').off('click').on('click',function(){
			var nowThis = $(this);
			var dataId = nowThis.attr('data-id');
			nowThis.css({'background':'#eee','color':'#555'});
			$this.val(nowThis.text());
			if(dataId) $this.attr('data-id',dataId);
			fn && fn($this,dataId);
			var time = setTimeout(function(){
	        	clearTimeout(time);
	        	dialog.hide();
	        },0)
		})
	},
	//获取url后面的参数
	getRequest : function(){
		var url = location.search; //获取url中"?"符后的字串   
	   	var theRequest = new Object();   
	   	if (url.indexOf("?") != -1) {   
	      	var str = url.substr(1);   
	      	strs = str.split("&");   
	      	for(var i = 0; i < strs.length; i ++) {   
	        	theRequest[strs[i].split("=")[0]]=decodeURI(strs[i].split("=")[1]);   
	      	}   
	   	}   
	  	return theRequest;   
	},
	//获取全部信息
	getAllView : function(){
		var allView = sessionStorage.getItem('allView');
		if(!!allView){
			baseFn.allViewObj = JSON.parse(allView);
			console.log(baseFn.allViewObj);
		}else{
			baseFn.setCommonAjax(baseFn.allViewUrl,'','GET',false,null,function(data){
				if(data.status == 'success'){
					console.log(data)
					sessionStorage.setItem('allView',JSON.stringify(data.data));
					if(data.data.mongo_log){
						window.location.href='errDispose.html?errType='+data.data.mongo_log.reject_reason+'';
						return;
					}
					baseFn.allViewObj = data.data;
					baseFn.judeStatus(data.data.ps.status);
				}else{
					baseFn.toastTip.setText('网络出现问题，请稍后重试');
					baseFn.toastTip.show();
				}
			},function(XMLHttpRequest, textStatus, errorThrown){
				baseFn.toastTip.setText('网络出现问题，请稍后重试');
				baseFn.toastTip.show();
			})
		}
	},
	
	//判断用户进程状态
	judeStatus : function(type){
		switch (type){
			case 'none':
				break;
			case 'forming':
			window.location.href = 'allViewInfor.html';
				break;
			case 'init_submit':
			window.location.href = 'noPay.html';
				break;
			case 'init_paid':
			window.location.href = 'myEvaluate.html';
				break;
			default : 
			window.location.href = 'myEvaluate.html';
				break;
		}
	},
}















