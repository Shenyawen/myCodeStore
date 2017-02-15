$(function() {
    var myEvaluate = {
        getUserInfor: function() {
            baseFn.setCommonAjax(baseFn.allViewUrl, '', 'POST', false, null, function(data) {
                if (data.status == 'success') {
                	if(data.data.mongo_log){
                		window.location.href = 'errDispose.html?errType='+data.data.mongo_log.reject_reason+'';
                		return;
                	}
                    var result = data.data;
                    switch (result.ps.status) {
                        case 'none': //未评价
                            window.location.href = 'noApplyEvaluate.html';
                            break;
                        case 'cancel'://人才评价取消
                        case 'init_approval_reject': //未通过专家评审
                        case 'prom_approval_reject': //未通过专家评审
                        case 'init_approval_refill': //打回修改
                        case 'prom_approval_refill': //打回修改
                        case 'init_check_reject': //未通过评审委审核
                        case 'prom_check_reject': //未通过评审委审核
                        case 'init_reapproval_reject': //未通过评审委复核
                        case 'prom_reapproval_reject': //未通过评审委复核
                        case 'init_public_reject': //举报处理
                        case 'prom_public_reject': //举报处理
                        case 'init_vote_reject': //选举失败
                        case 'prom_vote_reject': //选举失败
                            window.location.href = 'errDispose.html?errType=' + result.ps.err_msg + '';
                            break;
                        default:
                            $('body').removeClass('hide');
                            var starLevel = result.candidate.star_id,
                                starEntity = starLevel.split(''),
                                strarNum = starEntity[0],
                                Level = starEntity[1],
                                starListStr = '';
                            for (var i = 0; i < strarNum; i++) {
                                starListStr += '<li></li>';
                            };
                            $('#star-content').html(starListStr);
                            $('#star-level').html(Level.toUpperCase());
                            $('#userName').html(result.candidate.talent_name);
                            myEvaluate.judeStatus(result.ps.status);
                            break;
                    }
                }
            }, function(err) {
                $('body').removeClass('hide');
				baseFn.setPromptMsg('网络出现问题，请稍候重试！');
            })
        },
        judeStatus: function(status) {
            var statusCode = status,
                $type;
            $('.star-list').removeClass('hide');
            switch (statusCode) {
                case 'none':
                    $type = 'none';
                    $('.star-list').addClass('hide');
                    break;
                case 'forming':
                    $type = 'forming';
                    break;
                case 'init_submit':
                case 'prom_submit':
                    $type = 'init_submit';
                    break;
                case 'init_paid':
                case 'prom_paid':
                    $type = 'init_paid';
                    break;
                case 'init_approval_halfpass':
                case 'prom_approval_halfpass':
                    $type = 'init_approval_halfpass';
                    break;
                case 'init_approval_pass':
                case 'prom_approval_pass':
                    $type = 'init_approval_pass';
                    break;
                case 'init_check_pass':
                case 'prom_check_pass':
                    $type = 'init_check_pass';
                    break;
                case 'init_reapproval_pass':
                case 'prom_reapproval_pass':
                    $type = 'init_reapproval_pass';
                    break;
                case 'init_public':
                case 'prom_public':
                    $type = 'init_public';
                    break;
                case 'init_vote':
                case 'prom_vote':
                    $type = 'init_vote';
                    break;
                case 'init_star':
                case 'prom_star':
                    $type = 'init_star';
                    break;
                default:
                    break;
            }
            $index = $('#status-list-left li[data-type=' + $type + ']').index() + 1;
            $('ul#status-list-left li:lt(' + $index + '),ul#status-list-right li:lt(' + $index + ')').addClass('active');
        },
        init: function() {
            myEvaluate.getUserInfor();
        }
    }
    myEvaluate.init();
})