let allData = {};
$(function () {
    fetch('/assets/js/data.json')
    .then((response) => response.json())
    .then((json) => {
        allData = json;
        render()
        stickFooterToBottom();
    });
})

function render() {
    showMenu(allData.menu)
    showNavList(allData.navs)
    try {
        showHistory();
    } catch(err) {
        localStorage.removeItem('history-list');
    }
    //img lazy loaded
    const observer = lozad();
    observer.observe();
    $(document).on('click', '.col-sm-3 .xe-widget', function() {
        // 存储历史记录
        const url = $(this).attr('data-url');
        const pos = $(this).attr('data-pos');
        let list = localStorage.getItem('history-list') || '[]';
        list = JSON.parse(list).filter(t => t != pos).slice(0, 7);
        list.unshift(pos);
        localStorage.setItem('history-list', JSON.stringify(list));
        window.open(url, '_blank')
    })
}

// 最近使用
function showHistory() {
    const list = JSON.parse(localStorage.getItem('history-list') || '[]');
    const navs = [{
        name: '最近使用',
        list: []
    }];
    for (const item of list) {
        const [m, i] = item.split('_');
        navs[0].list.push(allData.navs[m].list[i]);
    }
    if (navs[0].list.length > 0) {
        showNavList(navs);
    }
}

// 渲染菜单栏
function showMenu(menu) {
    let html = ''
    for (const item of menu) {
        let aStr = ` href="${item.link ? item.link : '#' + item.name}" class="smooth"`
        let subStr = ''

        // 二级菜单
        if (item.children) {
            aStr = ''
            subStr += '<ul>'
            for (const subItem of item.children) {
                const label = subItem.label ? `<span class="label pull-right hidden-collapsed ${subItem.labelClass}">${subItem.label}</span>` : ''
                subStr += `
                <li>
                    <a href="#${subItem.name}" class="smooth">
                        <span class="title">${subItem.name}</span>
                        ${label}
                    </a>
                </li>
                `
            }
            subStr += '</ul>'
        }

        const label = item.label ? `<span class="label pull-right hidden-collapsed ${item.labelClass}">${item.label}</span>` : ''
        // 一级菜单
        html += `
        <li>
            <a${aStr}>
                <i class="${item.icon}"></i>
                <span class="title">${item.name}</span>
                ${label}
            </a>
            ${subStr}
        </li>
        `
    }
    $("#main-menu").html(html)
}

// 渲染导航列表
function showNavList(navs) {
    let html = ''
    // 分类
    navs.forEach((item, m) => {
        html += `<h4 class="text-gray"><i class="linecons-tag" style="margin-right: 7px;" id="${item.name}"></i>${item.name}</h4>`
        html += `<div class="row">`
        // 卡片
        const len = item.list.length
        item.list.forEach((nav, i) => {
            const pos = i + 1
            html += `
            <div class="col-sm-3">
                <div class="xe-widget xe-conversations box2 label-info" data-url="${nav.link}" data-pos="${m}_${i}" title="${nav.description}">
                    <div class="xe-comment-entry">
                        <a class="xe-user-img">
                            <img data-src="assets/images/logos/${nav.logo}" class="lozad img-circle" width="40">
                        </a>
                        <div class="xe-comment">
                            <a class="xe-user-name overflowClip_1">
                                <strong>${nav.title}</strong>
                            </a>
                            <p class="overflowClip_2">${nav.description}</p>
                        </div>
                    </div>
                </div>
            </div>
            `
            // 每四个换行显示
            if(pos!=len && pos%4==0){
                html += `</div><div class="row">`
            }
        })
        html += `</div><br/>`
    });
    $(".main-content nav").after(html)
}