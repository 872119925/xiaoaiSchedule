/** 
 * 江城院教务系统课程表（内网）
 * 
 * @author kujisa
 * @version 1.2
 * 
 * @see {@link https://ldtu0m3md0.feishu.cn/docs/doccnhZPl8KnswEthRXUz8ivnhb} 小爱开发者官方文档
 * @see {@link https://juejin.im/post/6844904135767097352} Cheerio官方翻译文档
 */


/**
 * 分析课程时间
 * 
 * @param {String} text 待分析的时间参数
 * @param {int} col 星期几，根据“列”来判断
 * @param {int} row 第几节课，根据“行”来判断
 * @param {Array} weeks 周数，可能为空或者有参数
 * @return {Array} {day,sections,weeks} 星期几 节数 周数
 */
function getTime(text, col, row, weeks) {
    let day = col;
    let sections = [];

    // 判断第几周
    let week = text.split('{')[0].split(',');
    for (let i = 0; i < week.length; i++) {
        let subWeek = week[i];
        if (subWeek.split('-')[1] != undefined) {
            let begin = subWeek.split('-')[0];
            let end = subWeek.split('-')[1];
            for (let j = parseInt(begin); j <= parseInt(end); j++) {
                weeks.push(parseInt(j));
            }
        } else {
            weeks.push(parseInt(subWeek));
        }
    }

    // 判断第几节
    let section = text.split('{')[1].split('}')[0];
    if (row <= 4) {
        sections.push({ section: parseInt(section.split('')[0]) }, { section: parseInt(section.split('')[1]) });
    } else if (row == 5) {
        if (section.length < 3) {
            sections.push({ section: parseInt(section) });
        } else {
            sections.push({ section: 9 },{ section: 10 });
        }
    } else if (row == 6) {
        if (section.length < 4) {
            sections.push({ section: parseInt(section) });
        } else {
            sections.push({ section: 11 },{ section: 12 });
        }
    }

    return {
        day: day,
        sections: sections,
        weeks: weeks
    };
}

/**
 * 处理实体编码与字符的转换
 * 
 * @param {String} entity 传入的实体编码
 * @return {String} 转换完成的字符
 */
function entityToString(entity) {
    $('#ets').remove();
    $('.box_content').append('<div id="ets"></div>');
    $('#ets').html(entity);
    var res = $('#ets').text();
    return res;
}

function scheduleHtmlParser(html) {
    let result = [];

    // 获取课表的div并遍历
    $('#TABLE1').find('tbody').find('tr').each(function (row) {

        // 忽略第一行的星期数据
        if (row > 0) {
            let offset = 0; //星期的偏移量
            $(this).find('td').each(function (col) {

                // 忽略第一列的“节”数据
                if (col > 0) {
                    if ($(this).text().length <= 6 && $(this).text().length > 0) {
                        // 如果该行列没有课程
                        offset++;
                    } else {
                        let infos = $(this).html().split('<br>');

                        // 可能有多余的空数据，不便于后面的判断，所以过滤空数据
                        infos = infos.filter(e => e.length != 0);

                        let index = 0;
                        if (infos[index] == infos[index + 1]) {
                            // 某些情况课程数据会重复
                            index += 1;
                        }

                        let hasNext = true;
                        while (hasNext) {
                            let singleinfo = entityToString(infos[index]).split('◇');
                            let singleIndex = 0;
                            let name = singleinfo[singleIndex];
                            let teacher = singleinfo[singleIndex + 1];
                            let position = singleinfo[singleIndex + 2];
                            let weeks = [];
                            let time = getTime(singleinfo[singleIndex + 3], col, row, weeks);

                            if (singleinfo[singleIndex + 5] != undefined) {
                                // 存在后面也拥有课程周的情况
                                if (singleinfo[singleIndex + 5].search("{") != -1) {
                                    let time2 = getTime(singleinfo[singleIndex + 5], col, row, weeks);
                                }
                            }

                            // 构建课程，添加至结果
                            let courseInfos = {
                                name: name,
                                position: position,
                                teacher: teacher,
                                weeks: time.weeks,
                                day: time.day,
                                sections: time.sections,
                            };
                            result.push(courseInfos);

                            // 进入下一个课程或退出
                            if (infos[index + 1] != undefined) {
                                index += 1;
                            } else {
                                hasNext = false;
                            }
                        }
                    }
                }
            });
        }
    });

    let sectionTime = [{
        "section": 1,
        "startTime": "08:00",
        "endTime": "08:45"
    },
    {
        "section": 2,
        "startTime": "08:55",
        "endTime": "09:40"
    },
    {
        "section": 3,
        "startTime": "09:50",
        "endTime": "10:35"
    },
    {
        "section": 4,
        "startTime": "10:45",
        "endTime": "11:30"
    },
    {
        "section": 5,
        "startTime": "14:00",
        "endTime": "14:45"
    },
    {
        "section": 6,
        "startTime": "14:55",
        "endTime": "15:40"
    },
    {
        "section": 7,
        "startTime": "15:50",
        "endTime": "16:35"
    },
    {
        "section": 8,
        "startTime": "16:45",
        "endTime": "17:30"
    },
    {
        "section": 9,
        "startTime": "18:00",
        "endTime": "18:45"
    },
    {
        "section": 10,
        "startTime": "18:45",
        "endTime": "19:30"
    },
    {
        "section": 11,
        "startTime": "19:40",
        "endTime": "20:25"
    },
    {
        "section": 12,
        "startTime": "20:25",
        "endTime": "21:10"
    }];
    return { courseInfos: result, sectionTimes: sectionTime }
}
