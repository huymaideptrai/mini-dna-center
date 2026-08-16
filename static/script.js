// ==========================================
// HÀM KHỞI CHẠY KHI TẢI TRANG
// ==========================================
window.onload = function() {
    // Khởi tạo 1 dòng mặc định cho các form (nếu có)
    if (typeof window.addInterfaceRow === "function") window.addInterfaceRow();
    if (typeof window.addOspfNetworkRow === "function") window.addOspfNetworkRow();
};

// ==========================================
// HÀM TIỆN ÍCH CHUNG
// ==========================================
window.openTab = function(evt, tabName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) { tabcontent[i].style.display = "none"; }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) { tablinks[i].className = tablinks[i].className.replace(" active", ""); }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
};

window.callAPI = async function(endpoint, data, btnId) {
    const btn = document.getElementById(btnId);
    const termBox = document.getElementById('terminal-box');
    const originalText = btn.innerText;

    btn.innerText = "⏳ Đang xử lý...";
    btn.style.background = "#f39c12";
    if(termBox) {
        termBox.style.display = "block";
        termBox.style.color = "#4af626";
        termBox.innerText = "Đang gửi lệnh xuống thiết bị mạng...\nĐợi một lát nhé...";
    }

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();

        if(termBox) {
            if(result.status === 'success') {
                termBox.innerText = "✅ THÀNH CÔNG!\n\n" + (result.ansible_log || "Cấu hình đã được áp dụng.");
            } else {
                termBox.style.color = "#ff4d4d";
                termBox.innerText = "❌ CÓ LỖI XẢY RA:\n\n" + (result.ansible_log || "Không rõ lỗi.");
            }
        }
    } catch (error) {
        if(termBox) {
            termBox.style.color = "#ff4d4d";
            termBox.innerText = "❌ Lỗi kết nối tới Server API!";
        }
    }

    btn.innerText = originalText;
    btn.style.background = "#28a745";
};


// ==========================================
// MODULE 0: BASIC (DAY-0, INTERFACES, SUB-INT)
// ==========================================
window.addInterfaceRow = function() {
    const container = document.getElementById('interfaces-container');
    if (!container) return;
    const row = document.createElement('div');
    row.className = 'interface-row card mb-3 border-0 shadow-sm';
    row.innerHTML = `
        <div class="card-body position-relative border-start border-3 border-success p-3 bg-white">
            <button type="button" class="btn btn-danger btn-sm position-absolute top-0 end-0 m-1 rounded-0 px-2" onclick="this.closest('.card').remove()" title="Xóa cổng này">X</button>
            <div class="row align-items-end pt-2 pe-3">
                <div class="col-md-3 mb-2 mb-md-0">
                    <label class="form-label small fw-bold text-muted">Loại Cổng</label>
                    <select class="form-select int-type"><option value="GigabitEthernet">GigabitEthernet</option><option value="FastEthernet">FastEthernet</option><option value="Loopback">Loopback</option><option value="Serial">Serial</option></select>
                </div>
                <div class="col-md-2 mb-2 mb-md-0"><label class="form-label small fw-bold text-muted">Số Cổng</label><input type="text" class="form-control int-number" placeholder="VD: 0/0"></div>
                <div class="col-md-3 mb-2 mb-md-0"><label class="form-label small fw-bold text-muted">IP Address</label><input type="text" class="form-control int-ip" placeholder="VD: 192.168.1.1"></div>
                <div class="col-md-4 mb-2 mb-md-0"><label class="form-label small fw-bold text-muted">Subnet Mask</label><input type="text" class="form-control int-mask" placeholder="VD: 255.255.255.0"></div>
            </div>
        </div>
    `;
    container.appendChild(row);
};

window.addSubInterfaceRow = function() {
    const container = document.getElementById('subint-container');
    if (!container) return;
    const row = document.createElement('div');
    row.className = 'subint-row card mb-2 border-0 shadow-sm';
    row.innerHTML = `
        <div class="card-body position-relative border-start border-3 p-3 bg-white" style="border-color: #00796b !important;">
            <button type="button" class="btn btn-danger btn-sm position-absolute top-0 end-0 m-1 rounded-0 px-2" onclick="this.closest('.card').remove()">X</button>
            <div class="row align-items-end pt-2 pe-3">
                <div class="col-md-3 mb-2"><label class="form-label small fw-bold text-muted">Sub-interface</label><input type="text" class="form-control subint-name" placeholder="VD: G0/1.10"></div>
                <div class="col-md-2 mb-2"><label class="form-label small fw-bold text-muted">VLAN ID</label><input type="number" class="form-control subint-vlan" placeholder="VD: 10"></div>
                <div class="col-md-3 mb-2"><label class="form-label small fw-bold text-muted">IP Address</label><input type="text" class="form-control subint-ip" placeholder="VD: 10.10.10.1"></div>
                <div class="col-md-4 mb-2"><label class="form-label small fw-bold text-muted">Subnet Mask</label><input type="text" class="form-control subint-mask" placeholder="VD: 255.255.255.0"></div>
            </div>
        </div>
    `;
    container.appendChild(row);
};

window.sendModule0 = function() {
    const interfaceList = [];
    document.querySelectorAll('.interface-row').forEach(row => {
        const prefix = row.querySelector('.int-type').value;
        const id = row.querySelector('.int-number').value.trim();
        const ip = row.querySelector('.int-ip').value.trim();
        if (id && ip) interfaceList.push({ "name": prefix + id, "ip": ip, "mask": row.querySelector('.int-mask').value.trim() });
    });

    const subIntList = [];
    document.querySelectorAll('.subint-row').forEach(row => {
        const name = row.querySelector('.subint-name').value.trim();
        const ip = row.querySelector('.subint-ip').value.trim();
        if (name && ip) subIntList.push({ "name": name, "vlan_id": parseInt(row.querySelector('.subint-vlan').value) || 0, "ip": ip, "mask": row.querySelector('.subint-mask').value.trim() });
    });

    const targetIp = document.getElementById('target_router_ip').value.trim();
    if (!targetIp) { alert("⚠️ Vui lòng nhập 'Địa chỉ IP Router'!"); return; }

    const data = {
        target_ip: targetIp,
        basic: {
            hostname: document.getElementById('m0_hostname') ? document.getElementById('m0_hostname').value : "",
            domain_name: document.getElementById('m0_domain') ? document.getElementById('m0_domain').value : "",
            admin_user: document.getElementById('m0_admin') ? document.getElementById('m0_admin').value : "",
            interfaces: interfaceList
        },
        subInterfaces: subIntList
    };
    console.log("📦 Dữ liệu Module 0:", data);
    window.callAPI('/api/config/module0-basic', data, 'btn-mod0');
};


// ==========================================
// MODULE 1: ROUTING (OSPF & BGP)
// ==========================================
window.addOspfSummaryRow = function() { /* ... Tương tự ... */ 
    const container = document.getElementById('ospf-summary-container');
    if (!container) return;
    const row = document.createElement('div');
    row.className = 'ospf-sum-row card mb-3 border-0 shadow-sm';
    row.innerHTML = `
        <div class="card-body position-relative border-start border-3 border-info p-3 bg-white">
            <button type="button" class="btn btn-danger btn-sm position-absolute top-0 end-0 m-1 rounded-0 px-2" onclick="this.closest('.card').remove()">X</button>
            <div class="row align-items-end pt-2 pe-3">
                <div class="col-md-4 mb-2 mb-md-0"><label class="form-label small fw-bold text-muted">Area ID</label><input type="number" class="ospf-sum-area form-control" value="1"></div>
                <div class="col-md-4 mb-2 mb-md-0"><label class="form-label small fw-bold text-muted">Summary IP</label><input type="text" class="ospf-sum-ip form-control" placeholder="VD: 192.168.0.0"></div>
                <div class="col-md-4 mb-2 mb-md-0"><label class="form-label small fw-bold text-muted">Subnet Mask</label><input type="text" class="ospf-sum-mask form-control" placeholder="VD: 255.255.252.0"></div>
            </div>
        </div>
    `;
    container.appendChild(row);
};

window.addOspfNetworkRow = function() {
    const container = document.getElementById('ospf-network-container');
    if (!container) return;
    const row = document.createElement('div');
    row.className = 'ospf-net-row card mb-3 border-0 shadow-sm';
    row.innerHTML = `
        <div class="card-body position-relative border-start border-3 border-warning p-3 bg-white">
            <button type="button" class="btn btn-danger btn-sm position-absolute top-0 end-0 m-1 rounded-0 px-2" onclick="this.closest('.card').remove()">X</button>
            <div class="row align-items-end pt-2 pe-3">
                <div class="col-md-4 mb-2 mb-md-0"><label class="form-label small fw-bold text-muted">Network IP</label><input type="text" class="ospf-ip form-control" placeholder="VD: 10.0.0.0"></div>
                <div class="col-md-4 mb-2 mb-md-0"><label class="form-label small fw-bold text-muted">Wildcard Mask</label><input type="text" class="ospf-wild form-control" placeholder="VD: 0.0.0.255"></div>
                <div class="col-md-4 mb-2 mb-md-0"><label class="form-label small fw-bold text-muted">Area ID</label><input type="number" class="ospf-area form-control" value="0"></div>
            </div>
        </div>
    `;
    container.appendChild(row);
};

window.addOspfAreaTypeRow = function() {
    const container = document.getElementById('ospf-area-type-container');
    if (!container) return;
    const row = document.createElement('div');
    row.className = 'ospf-area-type-row card mb-3 border-0 shadow-sm';
    row.innerHTML = `
        <div class="card-body position-relative border-start border-3 border-info p-3 bg-white">
            <button type="button" class="btn btn-danger btn-sm position-absolute top-0 end-0 m-1 rounded-0 px-2" onclick="this.closest('.card').remove()">X</button>
            <div class="row align-items-end pt-2 pe-3">
                <div class="col-md-6 mb-2 mb-md-0"><label class="form-label small fw-bold text-muted">Area ID</label><input type="number" class="ospf-type-area form-control" value="1"></div>
                <div class="col-md-6 mb-2 mb-md-0">
                    <label class="form-label small fw-bold text-muted">Loại Area (Area Type)</label>
                    <select class="ospf-type-sel form-select border-primary">
                        <option value="stub">Stub</option>
                        <option value="stub no-summary">Totally Stub (no-summary)</option>
                        <option value="nssa">NSSA</option>
                        <option value="nssa no-summary">Totally NSSA (no-summary)</option>
                    </select>
                </div>
            </div>
        </div>
    `;
    container.appendChild(row);
};

window.addOspfPassiveRow = function() {
    const container = document.getElementById('ospf-passive-container');
    if (!container) return;
    const row = document.createElement('div');
    row.className = 'ospf-passive-row card mb-2 border-0 shadow-sm';
    row.innerHTML = `
        <div class="card-body position-relative border-start border-3 border-secondary p-3 bg-white">
            <button type="button" class="btn btn-danger btn-sm position-absolute top-0 end-0 m-1 rounded-0 px-2" onclick="this.closest('.card').remove()">X</button>
            <div class="row align-items-end pt-2 pe-3">
                <div class="col-md-6 mb-2">
                    <label class="form-label small fw-bold text-muted">Passive Interface</label>
                    <input type="text" class="form-control ospf-passive-name" placeholder="VD: GigabitEthernet0/0">
                </div>
            </div>
        </div>
    `;
    container.appendChild(row);
};

window.addOspfInterfaceRow = function() {
    const container = document.getElementById('ospf-interface-container');
    if (!container) return;
    const row = document.createElement('div');
    row.className = 'ospf-int-row card mb-3 border-0 shadow-sm border-start border-3 border-danger';
    row.innerHTML = `
        <div class="card-body position-relative bg-white p-3">
            <button type="button" class="btn btn-danger btn-sm position-absolute top-0 end-0 m-2 px-2 py-0 shadow-sm" onclick="this.closest('.card').remove()">X</button>
            <div class="row mb-3 pe-4">
                <div class="col-md-4"><label class="form-label small fw-bold text-dark">Tên Cổng</label><input type="text" class="form-control ospf-int-name" placeholder="VD: G0/0"></div>
                <div class="col-md-4"><label class="form-label small fw-bold text-dark">Network Type</label>
                    <select class="form-select ospf-net-type"><option value="">Mặc định</option><option value="point-to-point">Point-to-Point</option><option value="broadcast">Broadcast</option></select>
                </div>
                <div class="col-md-4"><label class="form-label small fw-bold text-dark">Cost</label><input type="number" class="form-control ospf-cost" placeholder="Mặc định"></div>
            </div>
            <div class="row align-items-end pe-4">
                <div class="col-md-3"><label class="form-label small fw-bold text-dark">Hello (s)</label><input type="number" class="form-control ospf-hello" placeholder="VD: 10"></div>
                <div class="col-md-3"><label class="form-label small fw-bold text-dark">Dead (s)</label><input type="number" class="form-control ospf-dead" placeholder="VD: 40"></div>
                <div class="col-md-3"><label class="form-label small fw-bold text-dark">Authen Type</label>
                    <select class="form-select border-primary ospf-authen-type"><option value="">Không</option><option value="message-digest">MD5</option><option value="text">Clear Text</option></select>
                </div>
                <div class="col-md-3"><label class="form-label small fw-bold text-dark">Key/Pass</label><input type="text" class="form-control ospf-authen-key" placeholder="VD: 1 cisco123"></div>
            </div>
        </div>
    `;
    container.appendChild(row);
};

window.addOspfRedistributeRow = function() {
    const container = document.getElementById('ospf-redistribute-container');
    if (!container) return;
    const row = document.createElement('div');
    row.className = 'ospf-redis-row card mb-2 border-0 shadow-sm';
    row.innerHTML = `
        <div class="card-body position-relative border-start border-3 border-warning p-3 bg-white">
            <button type="button" class="btn btn-danger btn-sm position-absolute top-0 end-0 m-1 rounded-0 px-2" onclick="this.closest('.card').remove()">X</button>
            <div class="row align-items-end pt-2 pe-3">
                <div class="col-md-6 mb-2">
                    <label class="form-label small fw-bold text-muted">Giao thức nguồn</label>
                    <input type="text" class="form-control ospf-redis-proto" placeholder="VD: static, bgp 65000, connected...">
                </div>
                <div class="col-md-6 mb-2">
                    <label class="form-label small fw-bold text-muted">Metric (Tùy chọn)</label>
                    <input type="number" class="form-control ospf-redis-metric" placeholder="VD: 100">
                </div>
            </div>
        </div>
    `;
    container.appendChild(row);
};

window.toggleRouting = function(proto) {
    const sec = document.getElementById('sec-' + proto);
    const chk = document.getElementById('chk-' + proto);
    if (sec && chk) {
        sec.style.display = chk.checked ? 'block' : 'none';
    }
};

// --- CÁC HÀM TẠO FORM GIAO THỨC MỚI ---
window.addStaticRow = function() {
    const container = document.getElementById('static-container');
    if(!container) return;
    const row = document.createElement('div');
    row.className = 'static-row card mb-2 border-0 shadow-sm';
    row.innerHTML = `
        <div class="card-body position-relative border-start border-3 border-dark p-3 bg-white">
            <button type="button" class="btn btn-danger btn-sm position-absolute top-0 end-0 m-1 rounded-0 px-2" onclick="this.closest('.card').remove()">X</button>
            <div class="row align-items-end pt-2 pe-3">
                <div class="col-md-3 mb-2"><label class="form-label small fw-bold text-muted">Mạng đích</label><input type="text" class="form-control static-net" placeholder="VD: 192.168.2.0"></div>
                <div class="col-md-3 mb-2"><label class="form-label small fw-bold text-muted">Subnet Mask</label><input type="text" class="form-control static-mask" placeholder="VD: 255.255.255.0"></div>
                <div class="col-md-4 mb-2"><label class="form-label small fw-bold text-muted">Next-hop / Cổng ra</label><input type="text" class="form-control static-next" placeholder="VD: 10.0.0.2"></div>
                <div class="col-md-2 mb-2"><label class="form-label small fw-bold text-muted">AD (Tùy chọn)</label><input type="number" class="form-control static-ad" placeholder="VD: 10"></div>
            </div>
        </div>
    `;
    container.appendChild(row);
};

window.addEigrpRow = function() {
    const container = document.getElementById('eigrp-container');
    if(!container) return;
    const row = document.createElement('div');
    row.className = 'eigrp-row card mb-2 border-0 shadow-sm';
    row.innerHTML = `
        <div class="card-body position-relative border-start border-3 border-success p-3 bg-white">
            <button type="button" class="btn btn-danger btn-sm position-absolute top-0 end-0 m-1 rounded-0 px-2" onclick="this.closest('.card').remove()">X</button>
            <div class="row align-items-end pt-2 pe-3">
                <div class="col-md-3 mb-2"><label class="form-label small fw-bold text-muted">AS Number</label><input type="number" class="form-control eigrp-asn" value="100"></div>
                <div class="col-md-5 mb-2"><label class="form-label small fw-bold text-muted">Network</label><input type="text" class="form-control eigrp-net" placeholder="VD: 10.0.0.0"></div>
                <div class="col-md-4 mb-2"><label class="form-label small fw-bold text-muted">Wildcard Mask</label><input type="text" class="form-control eigrp-wild" placeholder="VD: 0.0.0.255"></div>
            </div>
        </div>
    `;
    container.appendChild(row);
};

window.addIsisRow = function() {
    const container = document.getElementById('isis-container');
    if(!container) return;
    const row = document.createElement('div');
    row.className = 'isis-row card mb-2 border-0 shadow-sm';
    row.innerHTML = `
        <div class="card-body position-relative border-start border-3 border-warning p-3 bg-white">
            <button type="button" class="btn btn-danger btn-sm position-absolute top-0 end-0 m-1 rounded-0 px-2" onclick="this.closest('.card').remove()">X</button>
            <div class="row align-items-end pt-2 pe-3">
                <div class="col-md-7 mb-2"><label class="form-label small fw-bold text-muted">NET Title</label><input type="text" class="form-control isis-net" placeholder="VD: 49.0001.0000.0000.0001.00"></div>
                <div class="col-md-5 mb-2"><label class="form-label small fw-bold text-muted">Bật IS-IS trên cổng</label><input type="text" class="form-control isis-int" placeholder="VD: G0/0"></div>
            </div>
        </div>
    `;
    container.appendChild(row);
};

window.addBgpNetworkRow = function() {
    const container = document.getElementById('bgp-network-container');
    if (!container) return;
    const row = document.createElement('div');
    row.className = 'bgp-net-row row mb-2 align-items-center';
    row.innerHTML = `
        <div class="col-10"><input type="text" class="form-control form-control-sm bgp-net-ip" placeholder="VD: 192.168.1.0 mask 255.255.255.0"></div>
        <div class="col-2"><button type="button" class="btn btn-danger btn-sm w-100 fw-bold" onclick="this.parentElement.parentElement.remove()">X</button></div>
    `;
    container.appendChild(row);
};

// --- BGP NEIGHBOR (NÂNG CAO) ---
window.addBgpNeighborRow = function() {
    const container = document.getElementById('bgp-neighbor-container');
    if (!container) return;
    const row = document.createElement('div');
    row.className = 'bgp-neigh-row card mb-3 border-0 shadow-sm';
    row.innerHTML = `
        <div class="card-body position-relative border-start border-3 border-danger p-3 bg-white">
            <button type="button" class="btn btn-danger btn-sm position-absolute top-0 end-0 m-1 rounded-0 px-2" onclick="this.closest('.card').remove()">X</button>
            <div class="row mb-2 pe-3">
                <div class="col-md-4"><label class="form-label small fw-bold text-muted">Neighbor IP</label><input type="text" class="bgp-ip form-control" placeholder="VD: 2.2.2.2"></div>
                <div class="col-md-4"><label class="form-label small fw-bold text-muted">Remote AS</label><input type="number" class="bgp-as form-control" placeholder="VD: 65001"></div>
                <div class="col-md-4 d-flex align-items-end pb-1">
                    <div class="form-check form-switch">
                        <input class="form-check-input bgp-rr" type="checkbox" id="rr_${Date.now()}">
                        <label class="form-check-label small fw-bold text-muted" for="rr_${Date.now()}">Route Reflector Client</label>
                    </div>
                </div>
            </div>
            <div class="row align-items-end pe-3">
                <div class="col-md-3 mb-2"><label class="form-label small fw-bold text-muted">Weight</label><input type="number" class="bgp-weight form-control" placeholder="Tùy chọn"></div>
                <div class="col-md-3 mb-2"><label class="form-label small fw-bold text-muted">Local Pref</label><input type="number" class="bgp-lp form-control" placeholder="Tùy chọn"></div>
                <div class="col-md-3 mb-2"><label class="form-label small fw-bold text-muted">MED</label><input type="number" class="bgp-med form-control" placeholder="Tùy chọn"></div>
                <div class="col-md-3 mb-2"><label class="form-label small fw-bold text-muted">AS-Path Prepend</label><input type="text" class="bgp-prepend form-control" placeholder="VD: 65000 65000"></div>
            </div>
        </div>
    `;
    container.appendChild(row);
};

// --- BGP REDISTRIBUTE & SUMMARY ---
window.addBgpRedistributeRow = window.addOspfRedistributeRow; // Dùng chung form với OSPF cho nhanh gọn, ta sẽ lọc class lúc gom dữ liệu

window.addBgpSummaryRow = function() {
    const container = document.getElementById('bgp-summary-container');
    if (!container) return;
    const row = document.createElement('div');
    row.className = 'bgp-sum-row card mb-2 border-0 shadow-sm';
    row.innerHTML = `
        <div class="card-body position-relative border-start border-3 border-danger p-3 bg-white">
            <button type="button" class="btn btn-danger btn-sm position-absolute top-0 end-0 m-1 rounded-0 px-2" onclick="this.closest('.card').remove()">X</button>
            <div class="row align-items-end pt-2 pe-3">
                <div class="col-md-6 mb-2"><label class="form-label small fw-bold text-muted">Aggregate IP</label><input type="text" class="bgp-sum-ip form-control" placeholder="VD: 10.0.0.0"></div>
                <div class="col-md-6 mb-2"><label class="form-label small fw-bold text-muted">Subnet Mask</label><input type="text" class="bgp-sum-mask form-control" placeholder="VD: 255.0.0.0"></div>
            </div>
        </div>
    `;
    container.appendChild(row);
};

window.sendModule1 = function() {
    const targetIp = document.getElementById('target_router_ip').value.trim();
    if (!targetIp) { alert("⚠️ Vui lòng nhập 'Địa chỉ IP Router'!"); return; }

    const data = { 
        target_ip: targetIp, 
        static_routes: [], 
        eigrp: [], 
        isis: [],
        ospf: null,
        bgp: null
    };

    // 1. Gom Static Route
    if (document.getElementById('chk-static') && document.getElementById('chk-static').checked) {
        document.querySelectorAll('.static-row').forEach(row => {
            const net = row.querySelector('.static-net').value.trim();
            if(net) data.static_routes.push({ 
                net: net, 
                mask: row.querySelector('.static-mask').value.trim(), 
                next_hop: row.querySelector('.static-next').value.trim(), 
                ad: parseInt(row.querySelector('.static-ad').value) || null 
            });
        });
    }

    // 2. Gom EIGRP
    if (document.getElementById('chk-eigrp') && document.getElementById('chk-eigrp').checked) {
        document.querySelectorAll('.eigrp-row').forEach(row => {
            const net = row.querySelector('.eigrp-net').value.trim();
            if(net) data.eigrp.push({ 
                asn: parseInt(row.querySelector('.eigrp-asn').value), 
                network: net, 
                wildcard: row.querySelector('.eigrp-wild').value.trim() 
            });
        });
    }

    // 3. Gom IS-IS
    if (document.getElementById('chk-isis') && document.getElementById('chk-isis').checked) {
        document.querySelectorAll('.isis-row').forEach(row => {
            const netTitle = row.querySelector('.isis-net').value.trim();
            if(netTitle) data.isis.push({ 
                net_title: netTitle, 
                interface: row.querySelector('.isis-int').value.trim() 
            });
        });
    }

    // 4. Gom OSPF (Quét toàn bộ 5 loại Form của bạn)
if (document.getElementById('chk-ospf') && document.getElementById('chk-ospf').checked) {
        const pidInput = document.getElementById('ospf_process_id');
        const routerIdInput = document.getElementById('ospf_router_id');
        
        const ospfConfig = {
            process_id: pidInput ? parseInt(pidInput.value) : 1,
            router_id: routerIdInput && routerIdInput.value.trim() ? routerIdInput.value.trim() : null,
            networks: [],
            areas: [],
            summaries: [],
            passive_interfaces: [],
            interfaces: [],
            redistributes: [] 
        };

        // Gom OSPF Networks 
        document.querySelectorAll('.ospf-net-row').forEach(row => {
            const ip = row.querySelector('.ospf-ip').value.trim();
            const wildcard = row.querySelector('.ospf-wild').value.trim();
            const area = row.querySelector('.ospf-area').value.trim();
            if(ip) ospfConfig.networks.push(`${ip} ${wildcard} area ${area}`);
        });

        // Gom OSPF Summary 
        document.querySelectorAll('.ospf-sum-row').forEach(row => {
            const ip = row.querySelector('.ospf-sum-ip').value.trim();
            const mask = row.querySelector('.ospf-sum-mask').value.trim();
            if(ip) ospfConfig.summaries.push({ network: ip, mask: mask });
        });

        // Gom OSPF Area Type 
        document.querySelectorAll('.ospf-area-type-row').forEach(row => {
            const areaId = row.querySelector('.ospf-type-area').value.trim();
            const type = row.querySelector('.ospf-type-sel').value;
            if(areaId) ospfConfig.areas.push({ area_id: areaId, area_type: type });
        });

        // Gom OSPF Passive Interfaces 
        document.querySelectorAll('.ospf-active-row, .ospf-passive-row').forEach(row => {
            const input = row.querySelector('.ospf-active-name, .ospf-passive-name'); 
            if(input && input.value.trim()) ospfConfig.passive_interfaces.push(input.value.trim());
        });

        // Gom OSPF Interfaces 
        document.querySelectorAll('.ospf-int-row').forEach(row => {
            const name = row.querySelector('.ospf-int-name').value.trim();
            if(name) {
                const intObj = {
                    name: name,
                    network_type: row.querySelector('.ospf-net-type').value || null,
                    cost: parseInt(row.querySelector('.ospf-cost').value) || null,
                    auth_key: row.querySelector('.ospf-authen-key').value.trim() || null
                };
                const hello = row.querySelector('.ospf-hello');
                const dead = row.querySelector('.ospf-dead');
                if (hello && hello.value) intObj.hello = parseInt(hello.value);
                if (dead && dead.value) intObj.dead = parseInt(dead.value);
                ospfConfig.interfaces.push(intObj);
            }
        });

        // Gom OSPF Redistribute
        document.querySelectorAll('#ospf-redistribute-container .ospf-redis-row').forEach(row => {
            const proto = row.querySelector('.ospf-redis-proto').value.trim();
            if(proto) {
                ospfConfig.redistributes.push({
                    protocol: proto,
                    metric: parseInt(row.querySelector('.ospf-redis-metric').value) || null
                });
            }
        });

        data.ospf = ospfConfig;
    }

    // 5. Gom BGP
if (document.getElementById('chk-bgp') && document.getElementById('chk-bgp').checked) {
        const localAsInput = document.getElementById('bgp_local_as');
        const bgpRouterIdInput = document.getElementById('bgp_router_id');
        
        const bgpConfig = {
            local_as: localAsInput ? parseInt(localAsInput.value) : 65000,
            router_id: bgpRouterIdInput && bgpRouterIdInput.value.trim() ? bgpRouterIdInput.value.trim() : null,
            networks: [],
            neighbors: [],
            redistributes: [],
            summaries: []
        };

        // Gom BGP Networks
        document.querySelectorAll('.bgp-net-row').forEach(row => {
            const net = row.querySelector('.bgp-net-ip').value.trim();
            if(net) bgpConfig.networks.push(net);
        });

        // Gom BGP Neighbors Nâng cao
        document.querySelectorAll('.bgp-neigh-row').forEach(row => {
            const ip = row.querySelector('.bgp-ip').value.trim();
            if(ip) {
                bgpConfig.neighbors.push({
                    ip: ip,
                    remote_as: parseInt(row.querySelector('.bgp-as').value) || 0,
                    route_reflector_client: row.querySelector('.bgp-rr').checked,
                    weight: parseInt(row.querySelector('.bgp-weight').value) || null,
                    set_local_pref: parseInt(row.querySelector('.bgp-lp').value) || null,
                    set_med: parseInt(row.querySelector('.bgp-med').value) || null,
                    set_as_path_prepend: row.querySelector('.bgp-prepend').value.trim() || null
                });
            }
        });

        // Gom BGP Redistribute (Sử dụng class chung với form ospf redis)
        document.querySelectorAll('#bgp-redistribute-container .ospf-redis-row').forEach(row => {
            const proto = row.querySelector('.ospf-redis-proto').value.trim();
     


       if(proto) {
                bgpConfig.redistributes.push({
                    protocol: proto,
                    metric: parseInt(row.querySelector('.ospf-redis-metric').value) || null
                });
            }
        });

        // Gom BGP Summary (Aggregate)
        document.querySelectorAll('.bgp-sum-row').forEach(row => {
            const ip = row.querySelector('.bgp-sum-ip').value.trim();
            if(ip) {
                bgpConfig.summaries.push({
                    network: ip,
                    mask: row.querySelector('.bgp-sum-mask').value.trim()
                });
            }
        });

        data.bgp = bgpConfig;
    }

    console.log("📦 Dữ liệu Module 1:", data);
    window.callAPI('/api/config/module1-routing', data, 'btn-mod1');
};

// ==========================================
// MODULE 2: VPN, DMVPN & FHRP
// ==========================================
window.toggleFhrpFields = function(selectElement) {
    const row = selectElement.closest('.card-body');
    const mode = selectElement.value;
    const vrrpOnly = row.querySelector('.vrrp-only');
    const glbpOnly = row.querySelector('.glbp-only');
    if(vrrpOnly) vrrpOnly.classList.toggle('d-none', mode !== 'vrrp');
    if(glbpOnly) glbpOnly.classList.toggle('d-none', mode !== 'glbp');
};

window.addHsrpRow = function() {
    const container = document.getElementById('hsrp-container');
    if (!container) return;
    const row = document.createElement('div');
    row.className = 'hsrp-row card mb-2 border-0 shadow-sm';
    row.innerHTML = `
        <div class="card-body position-relative border-start border-3 border-warning p-3 bg-white">
            <button type="button" class="btn btn-danger btn-sm position-absolute top-0 end-0 m-1 rounded-0 px-2" onclick="this.closest('.card').remove()">X</button>
            <div class="row align-items-end mb-3 pe-3">
                <div class="col-md-3 mb-2">
                    <label class="form-label small fw-bold text-muted">Protocol</label>
                    <select class="form-select fhrp-protocol" onchange="toggleFhrpFields(this)">
                        <option value="hsrp">HSRP</option>
                        <option value="vrrp">VRRP</option>
                        <option value="glbp">GLBP</option>
                    </select>
                </div>
                <div class="col-md-3 mb-2"><label class="form-label small fw-bold text-muted">Interface</label><input type="text" class="form-control fhrp-int" placeholder="VD: G0/1"></div>
                <div class="col-md-2 mb-2"><label class="form-label small fw-bold text-muted">Group ID</label><input type="number" class="form-control fhrp-grp" value="1"></div>
                <div class="col-md-4 mb-2"><label class="form-label small fw-bold text-muted">Virtual IP</label><input type="text" class="form-control fhrp-vip" placeholder="VD: 192.168.1.1"></div>
            </div>
            <div class="row pe-3 fhrp-extra-fields">
                <div class="col-md-3 mb-2"><label class="form-label small fw-bold text-muted">Priority</label><input type="number" class="form-control fhrp-pri" value="100"></div>
                <div class="col-md-3 mb-2 vrrp-only d-none"><label class="form-label small fw-bold text-muted">Adv. Interval (ms)</label><input type="number" class="form-control fhrp-adv" value="1000"></div>
                <div class="col-md-3 mb-2 glbp-only d-none"><label class="form-label small fw-bold text-muted">Load Balancing</label><select class="form-select fhrp-lb"><option value="round-robin">Round-Robin</option><option value="weighted">Weighted</option></select></div>
            </div>
        </div>
    `;
    container.appendChild(row);
};

window.toggleTunnelForm = function(id, mode) {
    const greDest = document.getElementById(`gre_dest_${id}`);
    const dmvpnFields = document.getElementById(`dmvpn_fields_${id}`);
    const spokeNhs = document.getElementById(`dmvpn_spoke_nhs_${id}`);
    const spokeNbma = document.getElementById(`dmvpn_spoke_nbma_${id}`);
    if (mode === 'gre') {
        if(greDest) greDest.classList.remove('d-none');
        if(dmvpnFields) dmvpnFields.classList.add('d-none');
    } else if (mode === 'dmvpn-hub') {
        if(greDest) greDest.classList.add('d-none');
        if(dmvpnFields) dmvpnFields.classList.remove('d-none');
        if(spokeNhs) spokeNhs.classList.add('d-none');
        if(spokeNbma) spokeNbma.classList.add('d-none');
    } else if (mode === 'dmvpn-spoke') {
        if(greDest) greDest.classList.add('d-none');
        if(dmvpnFields) dmvpnFields.classList.remove('d-none');
        if(spokeNhs) spokeNhs.classList.remove('d-none');
        if(spokeNbma) spokeNbma.classList.remove('d-none');
    }
};

window.addVpnTunnelRow = function() {
    const container = document.getElementById('vpn-tunnel-container');
    if (!container) return;
    const uniqueId = Date.now() + Math.floor(Math.random() * 1000);
    const row = document.createElement('div');
    row.className = 'vpn-tunnel-row card mb-3 border-0 shadow-sm';
    row.innerHTML = `
        <div class="card-body position-relative border-start border-3 border-success p-3 bg-white">
            <button type="button" class="btn btn-danger btn-sm position-absolute top-0 end-0 m-1 rounded-0 px-2 shadow-sm" onclick="this.closest('.card').remove()">X</button>
            <div class="row align-items-end mb-3 pe-4">
                <div class="col-md-4 mb-2 mb-md-0">
                    <label class="form-label small fw-bold text-success">Chọn chế độ VPN</label>
                    <select class="form-select border-success tunnel-mode-select" onchange="toggleTunnelForm('${uniqueId}', this.value)">
                        <option value="gre">GRE (Site-to-Site)</option><option value="dmvpn-hub">DMVPN (Hub)</option><option value="dmvpn-spoke">DMVPN (Spoke)</option>
                    </select>
                </div>
                <div class="col-md-2 mb-2 mb-md-0"><label class="form-label small fw-bold text-muted">Tunnel ID</label><input type="number" class="form-control tunnel-id" value="0"></div>
                <div class="col-md-6"><label class="form-label small fw-bold text-muted">IP Tunnel & Mask</label>
                    <div class="input-group"><input type="text" class="form-control tunnel-ip" placeholder="VD: 172.16.1.1"><input type="text" class="form-control tunnel-mask" placeholder="VD: 255.255.255.0"></div>
                </div>
            </div>
            <div class="row align-items-end pe-4">
                <div class="col-md-6 mb-2"><label class="form-label small fw-bold text-muted">Tunnel Source</label><input type="text" class="form-control tunnel-source" placeholder="VD: G0/1"></div>
                <div class="col-md-6 mb-2" id="gre_dest_${uniqueId}"><label class="form-label small fw-bold text-muted">Tunnel Destination</label><input type="text" class="form-control tunnel-dest" placeholder="VD: 8.8.8.8"></div>
            </div>
            <div class="row pt-3 mt-1 border-top d-none pe-4" id="dmvpn_fields_${uniqueId}">
                <div class="col-md-3 mb-2"><label class="form-label small fw-bold text-primary">NHRP ID</label><input type="number" class="form-control nhrp-id" placeholder="VD: 100"></div>
                <div class="col-md-3 mb-2"><label class="form-label small fw-bold text-primary">NHRP Pass</label><input type="text" class="form-control nhrp-key" placeholder="VD: cisco"></div>
                <div class="col-md-3 mb-2 d-none" id="dmvpn_spoke_nhs_${uniqueId}"><label class="form-label small fw-bold text-danger">NHS IP</label><input type="text" class="form-control nhs-ip" placeholder="VD: 172.16.1.254"></div>
                <div class="col-md-3 mb-2 d-none" id="dmvpn_spoke_nbma_${uniqueId}"><label class="form-label small fw-bold text-danger">NHS NBMA</label><input type="text" class="form-control nhs-nbma" placeholder="VD: 8.8.8.8"></div>
            </div>
            <div class="mt-2"><label style="cursor: pointer; font-weight: bold; color: #c0392b;"><input type="checkbox" class="vpn-tun-ipsec" checked> Bọc IPsec Profile</label></div>
        </div>
    `;
    container.appendChild(row);
};

window.sendModule2 = function() {
    const tunnels = [];
    document.querySelectorAll('.vpn-tunnel-row').forEach(row => {
        const ip = row.querySelector('.tunnel-ip') ? row.querySelector('.tunnel-ip').value.trim() : null;
        if (ip) {
            tunnels.push({
                "name": "Tunnel" + (row.querySelector('.tunnel-id').value || "0"),
                "ip": ip,
                "mask": row.querySelector('.tunnel-mask').value.trim(),
                "source": row.querySelector('.tunnel-source').value.trim(),
                "mode": row.querySelector('.tunnel-mode-select').value === "gre" ? "gre ip" : "gre multipoint",
                "destination": row.querySelector('.tunnel-dest').value.trim() || null,
                "nhrp_network_id": parseInt(row.querySelector('.nhrp-id').value) || null,
                "nhrp_nhs_ip": row.querySelector('.nhs-ip') ? row.querySelector('.nhs-ip').value.trim() : null,
                "apply_ipsec": row.querySelector('.vpn-tun-ipsec').checked
            });
        }
    });

    const fhrpList = [];
    document.querySelectorAll('.hsrp-row').forEach(row => {
        const intName = row.querySelector('.fhrp-int').value.trim();
        if (intName) {
            fhrpList.push({
                protocol: row.querySelector('.fhrp-protocol').value,
                interface: intName,
                group: parseInt(row.querySelector('.fhrp-grp').value) || 1,
                vip: row.querySelector('.fhrp-vip').value.trim(),
                priority: parseInt(row.querySelector('.fhrp-pri').value) || 100,
                vrrp_adv: parseInt(row.querySelector('.fhrp-adv').value) || null,
                glbp_lb: row.querySelector('.fhrp-lb') ? row.querySelector('.fhrp-lb').value : null
            });
        }
    });

    const targetIp = document.getElementById('target_router_ip').value.trim();
    if (!targetIp) { alert("⚠️ Vui lòng nhập 'Địa chỉ IP Router'!"); return; }

    const ikeKeyInput = document.getElementById('m2_ike_key');
    const data = {
        target_ip: targetIp,
        ipsec_global: {
            isakmp_policy: parseInt(document.getElementById('m2_ike_id') ? document.getElementById('m2_ike_id').value : 10) || 10,
            preshared_key: ikeKeyInput ? ikeKeyInput.value.trim() : "",
            encryption: document.getElementById('m2_ike_encr') ? document.getElementById('m2_ike_encr').value : "",
            dh_group: parseInt(document.getElementById('m2_ike_dh') ? document.getElementById('m2_ike_dh').value : 14) || 14,
            transform_set: document.getElementById('m2_ipsec_ts') ? document.getElementById('m2_ipsec_ts').value.trim() : "",
            ipsec_profile: document.getElementById('m2_ipsec_prof') ? document.getElementById('m2_ipsec_prof').value.trim() : ""
        },
        tunnels: tunnels,
        fhrp: fhrpList
    };
    console.log("📦 Dữ liệu Module 2:", data);
    window.callAPI('/api/config/module2-vpn', data, 'btn-mod2');
};


// ==========================================
// MODULE 3: NAT & QOS
// ==========================================
window.addNatStaticRow = function() {
    const container = document.getElementById('nat-static-container');
    if (!container) return;
    const row = document.createElement('div');
    // Bỏ class 'form-grid' để Bootstrap tự chia cột
    row.className = 'nat-static-row card mb-2 border-0 shadow-sm border-start border-3 p-3 bg-white';
    row.style.cssText = 'border-color: #9b59b6 !important; position: relative;';
    row.innerHTML = `
        <button type="button" class="btn btn-danger btn-sm position-absolute top-0 end-0 m-1 px-2 py-0" onclick="this.closest('.card').remove()">X</button>
        <div class="row align-items-end pe-3">
            <div class="col-md-4 mb-2"><label class="form-label small fw-bold text-muted">IP Inside (Local)</label><input type="text" class="form-control nat-in-ip" placeholder="VD: 192.168.1.10"></div>
            <div class="col-md-4 mb-2"><label class="form-label small fw-bold text-muted">IP Outside (Global)</label><input type="text" class="form-control nat-out-ip" placeholder="VD: 8.8.8.8"></div>
            <div class="col-md-4 mb-2"><label class="form-label small fw-bold text-muted">Port (Tùy chọn)</label><input type="number" class="form-control nat-port" placeholder="VD: 80"></div>
        </div>
    `;
    container.appendChild(row);
};

window.addAclRow = function() {
    const container = document.getElementById('acl-container');
    if (!container) return;
    
    const uniqueId = 'acl_' + Date.now(); // Tạo ID ngẫu nhiên cho mỗi ACL
    const row = document.createElement('div');
    row.className = 'acl-group-row card mb-3 border-primary shadow-sm';
    row.innerHTML = `
        <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center py-2">
            <span class="fw-bold"><i class="bi bi-shield-lock"></i> Cấu hình Access List</span>
            <button type="button" class="btn btn-sm btn-danger py-0" onclick="this.closest('.card').remove()">Xóa ACL này</button>
        </div>
        <div class="card-body bg-light">
            <div class="row mb-3 pb-3 border-bottom border-secondary">
                <div class="col-md-6">
                    <label class="form-label fw-bold text-dark">Tên / Số ACL</label>
                    <input type="text" class="form-control acl-name" placeholder="VD: 100 hoặc LAN_ACL">
                </div>
                <div class="col-md-6">
                    <label class="form-label fw-bold text-dark">Loại ACL</label>
                    <select class="form-select border-primary acl-type" onchange="toggleAclType('${uniqueId}', this.value)">
                        <option value="standard">Standard (Chỉ có IP Nguồn)</option>
                        <option value="extended">Extended (Có Đích & Port)</option>
                    </select>
                </div>
            </div>
            
            <div class="bg-white p-3 rounded border">
                <h6 class="fw-bold mb-3 text-secondary">Danh sách Luật (Rules / Networks):</h6>
                <!-- Nơi chứa các Rule của riêng ACL này -->
                <div id="rule-container-${uniqueId}"></div>
                
                <button type="button" class="btn btn-sm btn-secondary mt-2" onclick="addAclRuleRow('${uniqueId}')">+ Thêm Rule</button>
            </div>
        </div>
    `;
    container.appendChild(row);
    
    // Tự động thêm sẵn 1 dòng Rule trắng khi vừa tạo ACL
    addAclRuleRow(uniqueId);
};

// 2. Thêm một dòng Rule (Network) vào trong một ACL cụ thể
window.addAclRuleRow = function(aclId) {
    const container = document.getElementById(`rule-container-${aclId}`);
    if(!container) return;
    
    // Kiểm tra xem ACL mẹ đang là Standard hay Extended để ẩn hiện các ô tương ứng
    const aclCard = container.closest('.acl-group-row');
    const aclType = aclCard.querySelector('.acl-type').value;
    const extClass = (aclType === 'extended') ? '' : 'd-none';

    const row = document.createElement('div');
    row.className = 'acl-rule-row row align-items-center mb-2 pb-2 border-bottom';
    row.innerHTML = `
        <div class="col-11">
            <!-- Hàng 1: Nguồn -->
            <div class="row align-items-end mb-1">
                <div class="col-md-2 mb-1"><label class="small fw-bold text-muted">Hành động</label><select class="form-select form-select-sm acl-action"><option value="permit">Permit</option><option value="deny">Deny</option></select></div>
                <div class="col-md-2 mb-1 acl-ext-field ${extClass}"><label class="small fw-bold text-danger">Giao thức</label><select class="form-select form-select-sm acl-proto"><option value="ip">IP</option><option value="tcp">TCP</option><option value="udp">UDP</option></select></div>
                <div class="col-md-4 mb-1"><label class="small fw-bold text-muted">IP Nguồn (Source)</label><input type="text" class="form-control form-control-sm acl-src-ip" placeholder="VD: 192.168.1.0 hoặc any"></div>
                <div class="col-md-4 mb-1"><label class="small fw-bold text-muted">Wildcard Mask Nguồn</label><input type="text" class="form-control form-control-sm acl-src-mask" placeholder="VD: 0.0.0.255"></div>
            </div>
            <!-- Hàng 2: Đích (Chỉ hiện khi Extended) -->
            <div class="row align-items-end acl-ext-field ${extClass}">
                <div class="col-md-4 mb-1"><label class="small fw-bold text-danger">IP Đích (Destination)</label><input type="text" class="form-control form-control-sm acl-dst-ip" placeholder="VD: 8.8.8.8 hoặc any"></div>
                <div class="col-md-4 mb-1"><label class="small fw-bold text-danger">Wildcard Mask Đích</label><input type="text" class="form-control form-control-sm acl-dst-mask" placeholder="VD: 0.0.0.0"></div>
                <div class="col-md-4 mb-1"><label class="small fw-bold text-danger">Port (Tùy chọn)</label><input type="text" class="form-control form-control-sm acl-port" placeholder="VD: eq 80"></div>
            </div>
        </div>
        <div class="col-1 d-flex justify-content-center">
            <button type="button" class="btn btn-sm btn-danger fw-bold" onclick="this.closest('.acl-rule-row').remove()">X</button>
        </div>
    `;
    container.appendChild(row);
};

// 3. Hàm bật/tắt các ô Extended khi đổi loại ACL
window.toggleAclType = function(aclId, type) {
    const ruleContainer = document.getElementById(`rule-container-${aclId}`);
    if(!ruleContainer) return;
    const extFields = ruleContainer.querySelectorAll('.acl-ext-field');
    extFields.forEach(field => {
        if(type === 'extended') field.classList.remove('d-none');
        else field.classList.add('d-none');
    });
};

window.addQosClassRow = function() {
    const container = document.getElementById('qos-class-container');
    if (!container) return;
    const row = document.createElement('div');
    row.className = 'qos-class-row form-grid card mb-2 border-0 shadow-sm border-start border-3 p-3 bg-white';
    row.style.cssText = 'border-color: #34495e !important; position: relative;';
    row.innerHTML = `
        <button type="button" class="btn btn-danger btn-sm position-absolute top-0 end-0 m-1 px-2 py-0" onclick="this.closest('.card').remove()">X</button>
        <div class="row align-items-end pe-3">
            <div class="col-md-3 mb-2"><label class="small fw-bold text-muted">Tên Class</label><input type="text" class="form-control qos-cname" placeholder="VD: VOICE"></div>
            <div class="col-md-3 mb-2"><label class="small fw-bold text-muted">Điều kiện</label><input type="text" class="form-control qos-match" placeholder="VD: dscp ef"></div>
            <div class="col-md-3 mb-2"><label class="small fw-bold text-muted">Policy</label>
                <select class="form-select qos-action"><option value="priority percent">Priority %</option><option value="bandwidth percent">Bandwidth %</option><option value="police">Police bps</option></select>
            </div>
            <div class="col-md-3 mb-2"><label class="small fw-bold text-muted">Giá trị</label><input type="number" class="form-control qos-val" placeholder="VD: 30"></div>
        </div>
    `;
    container.appendChild(row);
};

window.sendModule3 = function() {
    const staticNat = [];
    document.querySelectorAll('.nat-static-row').forEach(row => {
        const inIp = row.querySelector('.nat-in-ip').value.trim();
        const outIp = row.querySelector('.nat-out-ip').value.trim();
        const port = parseInt(row.querySelector('.nat-port').value);
        if (inIp && outIp) staticNat.push({ inside_ip: inIp, outside_ip: outIp, port: isNaN(port) ? null : port });
    });

    const qosClasses = [];
    document.querySelectorAll('.qos-class-row').forEach(row => {
        const name = row.querySelector('.qos-cname').value.trim();
        const match = row.querySelector('.qos-match').value.trim();
        if (name && match) qosClasses.push({ class_name: name, match: match, action: row.querySelector('.qos-action').value, value: parseInt(row.querySelector('.qos-val').value) || 0 });
    });

    const targetIp = document.getElementById('target_router_ip').value.trim();
    if (!targetIp) { alert("⚠️ Vui lòng nhập 'Địa chỉ IP Router'!"); return; }

    const insideInts = [];
    document.querySelectorAll('.inside-row input').forEach(inp => { if(inp.value.trim()) insideInts.push(inp.value.trim()); });
    
    const outsideInts = [];
    document.querySelectorAll('.outside-row input').forEach(inp => { if(inp.value.trim()) outsideInts.push(inp.value.trim()); });

    // --- Gom dữ liệu ACL Động ---
    const acls = [];
    document.querySelectorAll('.acl-group-row').forEach(aclRow => {
        const name = aclRow.querySelector('.acl-name').value.trim();
        const type = aclRow.querySelector('.acl-type').value;
        if (!name) return; // Bỏ qua nếu không nhập tên ACL
        
        const rules = [];
        aclRow.querySelectorAll('.acl-rule-row').forEach(ruleRow => {
            const rule = {
                action: ruleRow.querySelector('.acl-action').value,
                src_ip: ruleRow.querySelector('.acl-src-ip').value.trim(),
                src_mask: ruleRow.querySelector('.acl-src-mask').value.trim()
            };
            // Chỉ lấy Đích/Port nếu là Extended
            if (type === 'extended') {
                rule.protocol = ruleRow.querySelector('.acl-proto').value;
                rule.dst_ip = ruleRow.querySelector('.acl-dst-ip').value.trim();
                rule.dst_mask = ruleRow.querySelector('.acl-dst-mask').value.trim();
                rule.port = ruleRow.querySelector('.acl-port').value.trim();
            }
            rules.push(rule);
        });
        acls.push({ name: name, type: type, rules: rules });
    });

    const data = {
        target_ip: targetIp,
        nat: {
            mode: document.getElementById('nat_type_select').value,
            inside_interfaces: insideInts,
            outside_interfaces: outsideInts,
            dynamic: {
                acl_name: document.getElementById('m3_nat_acl') ? document.getElementById('m3_nat_acl').value.trim() : "NAT_ACL",
                interface: document.getElementById('m3_nat_int') ? document.getElementById('m3_nat_int').value.trim() : ""
            },
            static: staticNat
        },
        acl: acls,
        qos: {
            policy_name: document.getElementById('m3_qos_policy') ? document.getElementById('m3_qos_policy').value.trim() : "",
            apply_interface: document.getElementById('m3_qos_int') ? document.getElementById('m3_qos_int').value.trim() : "",
            classes: qosClasses
        }
    }
    console.log("📦 Dữ liệu Module 3:", data);
    window.callAPI('/api/config/module3-protocol', data, 'btn-mod3');
};

// UI DOM Listeners cho NAT (Bắt sự kiện nút thêm)
document.addEventListener('DOMContentLoaded', function() {
    const btnAddInside = document.getElementById('btn_add_inside');
    if (btnAddInside) {
        btnAddInside.addEventListener('click', function() {
            const container = document.getElementById('inside-int-container');
            const div = document.createElement('div');
            div.className = 'row mb-2 align-items-center';
            div.innerHTML = `<div class="col-10"><input type="text" class="form-control" placeholder="VD: G0/0"></div><div class="col-2"><button type="button" class="btn btn-danger w-100 fw-bold btn-remove-int">X</button></div>`;
            container.appendChild(div);
        });
    }

    const btnAddOutside = document.getElementById('btn_add_outside');
    if (btnAddOutside) {
        btnAddOutside.addEventListener('click', function() {
            const container = document.getElementById('outside-int-container');
            const div = document.createElement('div');
            div.className = 'row mb-2 align-items-center';
            div.innerHTML = `<div class="col-10"><input type="text" class="form-control" placeholder="VD: G0/1"></div><div class="col-2"><button type="button" class="btn btn-danger w-100 fw-bold btn-remove-int">X</button></div>`;
            container.appendChild(div);
        });
    }

    document.addEventListener('click', function(e) {
        if (e.target && e.target.classList.contains('btn-remove-int')) e.target.closest('.row').remove();
    });

    const natSelect = document.getElementById('nat_type_select');
    if (natSelect) {
        natSelect.addEventListener('change', function() {
            const overloadForm = document.getElementById('nat_overload_form');
            const staticForm = document.getElementById('nat_static_form');
            if (this.value === 'overload') {
                if(overloadForm) overloadForm.classList.remove('d-none');
                if(staticForm) staticForm.classList.add('d-none');
            } else {
                if(overloadForm) overloadForm.classList.add('d-none');
                if(staticForm) staticForm.classList.remove('d-none');
            }
        });
    }
});
const aclSelect = document.getElementById('acl_type_select');
    if (aclSelect) {
        aclSelect.addEventListener('change', function() {
            const protoCol = document.getElementById('acl_protocol_col');
            const extFields = document.getElementById('acl_extended_fields');
            
            if (this.value === 'extended') {
                // Hiện Giao thức và các trường Đích/Port
                if(protoCol) protoCol.classList.remove('d-none');
                if(extFields) extFields.classList.remove('d-none');
            } else {
                // Ẩn đi nếu chọn lại Standard
                if(protoCol) protoCol.classList.add('d-none');
                if(extFields) extFields.classList.add('d-none');
            }
        });
    }


// ==========================================
// MODULE 4: SERVICES & MGMT (Bao gồm cả NTP)
// ==========================================
window.addAaaRow = function() {
    const container = document.getElementById('aaa-container');
    if(!container) return;
    const row = document.createElement('div');
    row.className = 'aaa-row card mb-2 border-0 shadow-sm';
    row.innerHTML = `
        <div class="card-body position-relative border-start border-3 border-purple p-3 bg-white" style="border-color: #9c27b0 !important;">
            <button type="button" class="btn btn-danger btn-sm position-absolute top-0 end-0 m-1 rounded-0 px-2" onclick="this.closest('.card').remove()">X</button>
            <div class="row align-items-end pt-2 pe-3">
                <div class="col-md-3 mb-2 mb-md-0"><label class="form-label small fw-bold text-muted">Loại Server</label><select class="form-select aaa-type"><option value="radius">RADIUS</option><option value="tacacs+">TACACS+</option></select></div>
                <div class="col-md-4 mb-2 mb-md-0"><label class="form-label small fw-bold text-muted">IP Server</label><input type="text" class="form-control aaa-ip" placeholder="VD: 10.0.0.100"></div>
                <div class="col-md-5"><label class="form-label small fw-bold text-muted">Secret Key</label><input type="text" class="form-control aaa-key" placeholder="VD: cisco123"></div>
            </div>
        </div>
    `;
    container.appendChild(row);
};

window.addSyslogRow = function() {
    const container = document.getElementById('syslog-container');
    if(!container) return;
    const row = document.createElement('div');
    row.className = 'syslog-row card mb-2 border-0 shadow-sm';
    row.innerHTML = `
        <div class="card-body position-relative border-start border-3 border-primary p-3 bg-white">
            <button type="button" class="btn btn-danger btn-sm position-absolute top-0 end-0 m-1 rounded-0 px-2" onclick="this.closest('.card').remove()">X</button>
            <div class="row align-items-end pt-2 pe-3">
                <div class="col-md-4 mb-2"><label class="form-label small fw-bold text-muted">Syslog Server IP</label><input type="text" class="form-control syslog-ip" placeholder="VD: 192.168.1.50"></div>
                <div class="col-md-4 mb-2"><label class="form-label small fw-bold text-muted">Trap Level (0-7)</label>
                    <select class="form-select syslog-level">
                        <option value="0">0 - Emergencies</option>
                        <option value="1">1 - Alerts</option>
                        <option value="2">2 - Critical</option>
                        <option value="3">3 - Errors</option>
                        <option value="4" selected>4 - Warnings</option>
                        <option value="5">5 - Notifications</option>
                        <option value="6">6 - Informational</option>
                        <option value="7">7 - Debugging</option>
                    </select>
                </div>
                <div class="col-md-4 mb-2"><label class="form-label small fw-bold text-muted">Source Interface (Tùy chọn)</label><input type="text" class="form-control syslog-src" placeholder="VD: Loopback0"></div>
            </div>
        </div>
    `;
    container.appendChild(row);
};

window.addDhcpRelayRow = function() {
    const container = document.getElementById('dhcp-relay-container');
    if(!container) return;
    const row = document.createElement('div');
    row.className = 'dhcp-relay-row card mb-2 border-0 shadow-sm';
    row.innerHTML = `
        <div class="card-body position-relative border-start border-3 border-info p-3 bg-white">
            <button type="button" class="btn btn-danger btn-sm position-absolute top-0 end-0 m-1 rounded-0 px-2" onclick="this.closest('.card').remove()">X</button>
            <div class="row align-items-end pt-2 pe-3">
                <div class="col-md-6 mb-2"><label class="form-label small fw-bold text-muted">Cổng nhận IP (Interface)</label><input type="text" class="form-control dhcp-relay-int" placeholder="VD: G0/1"></div>
                <div class="col-md-6 mb-2"><label class="form-label small fw-bold text-muted">IP Helper Address</label><input type="text" class="form-control dhcp-relay-ip" placeholder="VD: 10.0.0.100"></div>
            </div>
        </div>
    `;
    container.appendChild(row);
};

window.addFtpRow = function() {
    const container = document.getElementById('ftp-container');
    if(!container) return;
    const row = document.createElement('div');
    row.className = 'ftp-row card mb-2 border-0 shadow-sm';
    row.innerHTML = `
        <div class="card-body position-relative border-start border-3 border-info p-3 bg-white">
            <button type="button" class="btn btn-danger btn-sm position-absolute top-0 end-0 m-1 rounded-0 px-2" onclick="this.closest('.card').remove()">X</button>
            <div class="row align-items-end pt-2 pe-3">
                <div class="col-md-3 mb-2 mb-md-0"><label class="form-label small fw-bold text-muted">Giao thức</label><select class="form-select ftp-type"><option value="tftp">TFTP</option><option value="ftp">FTP</option></select></div>
                <div class="col-md-3 mb-2 mb-md-0"><label class="form-label small fw-bold text-muted">Server IP</label><input type="text" class="form-control ftp-ip" placeholder="VD: 172.16.0.5"></div>
                <div class="col-md-3 mb-2 mb-md-0"><label class="form-label small fw-bold text-muted">Username</label><input type="text" class="form-control ftp-user" placeholder="VD: admin"></div>
                <div class="col-md-3"><label class="form-label small fw-bold text-muted">Password</label><input type="text" class="form-control ftp-pass" placeholder="***"></div>
            </div>
        </div>
    `;
    container.appendChild(row);
};

window.addDhcpRow = function() {
    const container = document.getElementById('dhcp-container');
    if(!container) return;
    const row = document.createElement('div');
    row.className = 'dhcp-row card mb-3 border-0 shadow-sm';
    row.innerHTML = `
        <div class="card-body position-relative border-start border-3 border-success p-3 bg-white">
            <button type="button" class="btn btn-danger btn-sm position-absolute top-0 end-0 m-1 rounded-0 px-2" onclick="this.closest('.card').remove()">X</button>
            <div class="row mb-3 pe-3">
                <div class="col-md-4 mb-2 mb-md-0"><label class="form-label small fw-bold text-muted">Tên Pool DHCP</label><input type="text" class="form-control dhcp-name" placeholder="VD: LAN_POOL"></div>
                <div class="col-md-4 mb-2 mb-md-0"><label class="form-label small fw-bold text-muted">Network IP</label><input type="text" class="form-control dhcp-net" placeholder="VD: 192.168.10.0"></div>
                <div class="col-md-4 mb-2 mb-md-0"><label class="form-label small fw-bold text-muted">Subnet Mask</label><input type="text" class="form-control dhcp-mask" placeholder="VD: 255.255.255.0"></div>
            </div>
            <div class="row pe-3">
                <div class="col-md-4 mb-2 mb-md-0"><label class="form-label small fw-bold text-muted">Default Router</label><input type="text" class="form-control dhcp-gw" placeholder="VD: 192.168.10.1"></div>
                <div class="col-md-4 mb-2 mb-md-0"><label class="form-label small fw-bold text-muted">DNS Server</label><input type="text" class="form-control dhcp-dns" placeholder="VD: 8.8.8.8"></div>
                <div class="col-md-4 mb-2 mb-md-0"><label class="form-label small fw-bold text-danger">IP Loại trừ</label><input type="text" class="form-control dhcp-exclude" placeholder="VD: 192.168.10.1 192.168.10.10"></div>
            </div>
        </div>
    `;
    container.appendChild(row);
};

window.addIpSlaRow = function() {
    const container = document.getElementById('ipsla-container');
    if(!container) return;
    const row = document.createElement('div');
    row.className = 'ipsla-row card mb-2 border-0 shadow-sm';
    row.innerHTML = `
    <div class="card-body position-relative border-start border-3 border-warning p-3 bg-white">
            <button type="button" class="btn btn-danger btn-sm position-absolute top-0 end-0 m-1 rounded-0 px-2" onclick="this.closest('.card').remove()">X</button>
            <div class="row align-items-end pt-2 pe-3">
                <div class="col-md-2 mb-2"><label class="form-label small fw-bold text-muted">SLA ID</label><input type="number" class="form-control sla-id" value="1"></div>
                <div class="col-md-3 mb-2"><label class="form-label small fw-bold text-muted">Giao thức</label>
                    <select class="form-select sla-proto"><option value="icmp-echo">ICMP Echo</option><option value="udp-echo">UDP Echo</option><option value="tcp-connect">TCP Connect</option></select>
                </div>
                <div class="col-md-3 mb-2"><label class="form-label small fw-bold text-muted">IP Đích</label><input type="text" class="form-control sla-dest" placeholder="VD: 8.8.8.8"></div>
                <div class="col-md-4 mb-2"><label class="form-label small fw-bold text-muted">Source Interface</label><input type="text" class="form-control sla-src" placeholder="VD: G0/0"></div>
            </div>
            <div class="row align-items-end pe-3 mt-2">
                <div class="col-md-4 mb-2"><label class="form-label small fw-bold text-muted">Tần suất (Giây)</label><input type="number" class="form-control sla-freq" value="5"></div>
                <div class="col-md-4 mb-2"><label class="form-label small fw-bold text-muted">Lịch biểu</label><select class="form-select sla-sched"><option value="life forever">Life Forever (Chạy luôn)</option></select></div>
            </div>
        </div>
    `;
    container.appendChild(row);
};

window.addNtpRow = function() {
    const container = document.getElementById('ntp-container');
    if(!container) return;
    const row = document.createElement('div');
    row.className = 'ntp-row card mb-2 border-0 shadow-sm';
    row.innerHTML = `
        <div class="card-body position-relative border-start border-3 border-primary p-3 bg-white">
            <button type="button" class="btn btn-danger btn-sm position-absolute top-0 end-0 m-1 rounded-0 px-2" onclick="this.closest('.card').remove()">X</button>
            <div class="row align-items-end pt-2 pe-3">
                <div class="col-md-2 mb-2">
                    <label class="form-label small fw-bold text-muted">Role</label>
                    <select class="form-select ntp-role border-primary" onchange="toggleNtpFields(this)">
                        <option value="client">Client</option><option value="master">Master</option><option value="peer">Peer</option><option value="broadcast">Broadcast</option><option value="multicast">Multicast</option>
                    </select>
                </div>
                <div class="col-md-3 mb-2 ntp-ip-box"><label class="form-label small fw-bold text-muted">IP Address</label><input type="text" class="form-control ntp-ip" placeholder="VD: 8.8.8.8"></div>
                <div class="col-md-2 mb-2 ntp-stratum-box" style="display: none;"><label class="form-label small fw-bold text-muted">Stratum</label><input type="number" class="form-control ntp-stratum" placeholder="VD: 2"></div>
                <div class="col-md-3 mb-2 ntp-int-box" style="display: none;"><label class="form-label small fw-bold text-muted">Interface (Cổng)</label><input type="text" class="form-control ntp-int" placeholder="VD: G0/0"></div>
                <div class="col-md-2 mb-2 ntp-dir-box" style="display: none;">
                    <label class="form-label small fw-bold text-muted">Direction</label>
                    <select class="form-select ntp-dir"><option value="">-- Trống --</option><option value="send">Send</option><option value="receive">Receive</option></select>
                </div>
            </div>
        </div>
    `;
    container.appendChild(row);
};

window.toggleNtpFields = function(selectElem) {
    const row = selectElem.closest('.ntp-row');
    const role = selectElem.value;
    const ipBox = row.querySelector('.ntp-ip-box');
    const stratumBox = row.querySelector('.ntp-stratum-box');
    const intBox = row.querySelector('.ntp-int-box');
    const dirBox = row.querySelector('.ntp-dir-box');

    if(ipBox) ipBox.style.display = 'none';
    if(stratumBox) stratumBox.style.display = 'none';
    if(intBox) intBox.style.display = 'none';
    if(dirBox) dirBox.style.display = 'none';

    if (role === 'client' || role === 'peer') {
        if(ipBox) ipBox.style.display = 'block';
    } else if (role === 'master') {
        if(stratumBox) stratumBox.style.display = 'block';
    } else if (role === 'broadcast') {
        if(intBox) intBox.style.display = 'block';
        if(dirBox) dirBox.style.display = 'block';
    } else if (role === 'multicast') {
        if(intBox) intBox.style.display = 'block';
        if(dirBox) dirBox.style.display = 'block';
        if(ipBox) ipBox.style.display = 'block';
    }
};

window.sendModule4 = function() {
    const aaa = [];
    document.querySelectorAll('.aaa-row').forEach(row => {
        const type = row.querySelector('.aaa-type').value;
        const ip = row.querySelector('.aaa-ip').value.trim();
        const key = row.querySelector('.aaa-key').value.trim();
        if(ip && key) aaa.push({ type: type, ip: ip, key: key });
    });

    const syslog = [];
    document.querySelectorAll('.syslog-row').forEach(row => {
        const ip = row.querySelector('.syslog-ip').value.trim();
        if(ip) syslog.push({ ip: ip, level: parseInt(row.querySelector('.syslog-level').value) || 4 });
    });

    const fileTransfer = [];
    document.querySelectorAll('.ftp-row').forEach(row => {
        const ip = row.querySelector('.ftp-ip').value.trim();
        if(ip) fileTransfer.push({ type: row.querySelector('.ftp-type').value, ip: ip, user: row.querySelector('.ftp-user').value.trim(), pass: row.querySelector('.ftp-pass').value.trim() });
    });

    const dhcp = [];
    document.querySelectorAll('.dhcp-row').forEach(row => {
        const name = row.querySelector('.dhcp-name').value.trim();
        if(name) {
            dhcp.push({
                name: name, net: row.querySelector('.dhcp-net').value.trim(), mask: row.querySelector('.dhcp-mask').value.trim(),
                gw: row.querySelector('.dhcp-gw').value.trim(), dns: row.querySelector('.dhcp-dns').value.trim(), exclude: row.querySelector('.dhcp-exclude').value.trim()
            });
        }
    });

    const ipsla = [];
    document.querySelectorAll('.ipsla-row').forEach(row => {
        const dest = row.querySelector('.sla-dest').value.trim();
        if(dest) ipsla.push({ id: parseInt(row.querySelector('.sla-id').value) || 1, dest: dest, freq: parseInt(row.querySelector('.sla-freq').value) || 5, sched: row.querySelector('.sla-sched').value });
    });

    const ntpList = [];
    document.querySelectorAll('.ntp-row').forEach(row => {
        const role = row.querySelector('.ntp-role').value;
        const ipVal = row.querySelector('.ntp-ip') ? row.querySelector('.ntp-ip').value.trim() : "";
        const stratumVal = row.querySelector('.ntp-stratum') ? row.querySelector('.ntp-stratum').value.trim() : "";
        const intVal = row.querySelector('.ntp-int') ? row.querySelector('.ntp-int').value.trim() : "";
        const dirVal = row.querySelector('.ntp-dir') ? row.querySelector('.ntp-dir').value : "";
        
        let valid = false;
        if ((role === 'client' || role === 'peer') && ipVal) valid = true;
        if (role === 'master' && stratumVal) valid = true;
        if (role === 'broadcast' && intVal) valid = true;
        if (role === 'multicast' && intVal && ipVal) valid = true;

        if(valid) {
            ntpList.push({
                role: role,
                ip_address: ipVal !== "" ? ipVal : null,
                stratum: stratumVal !== "" ? parseInt(stratumVal) : null,
                interface: intVal !== "" ? intVal : null,
                direction: dirVal !== "" ? dirVal : null
            });
        }
    });

    const targetIp = document.getElementById('target_router_ip').value.trim();
    if (!targetIp) { alert("⚠️ Vui lòng nhập 'Địa chỉ IP Router'!"); return; }

    const data = { 
        target_ip: targetIp, 
        aaa: aaa, 
        syslog: syslog, 
        file_transfer: fileTransfer, 
        dhcp: dhcp, 
        ipsla: ipsla,
        ntp: ntpList
    };
    console.log("📦 Dữ liệu Module 4:", data);
    window.callAPI('/api/config/module4-services', data, 'btn-mod4');
};

// ==========================================
// MODULE 5: GIÁM SÁT (TELEMETRY / MONITOR)
// ==========================================
let monitorInterval = null;

window.toggleMonitoring = function() {
    const btn = document.getElementById('btn-start-monitor');
    const targetIp = document.getElementById('target_router_ip').value.trim();
    
    if (!targetIp) { alert("⚠️ Vui lòng nhập 'Địa chỉ IP Router' trước khi giám sát!"); return; }

    if (monitorInterval) {
        // Tắt giám sát
        clearInterval(monitorInterval);
        monitorInterval = null;
        btn.innerHTML = "▶ Bắt đầu Giám sát";
        btn.className = "btn btn-sm btn-light fw-bold text-info shadow-sm";
    } else {
        // Bật giám sát
        btn.innerHTML = "🛑 Dừng Giám sát";
        btn.className = "btn btn-sm btn-danger fw-bold shadow-sm";
        
        // Cập nhật ngay lập tức 1 lần, sau đó lặp lại mỗi 5 giây (5000ms)
        fetchMonitorData(targetIp);
        monitorInterval = setInterval(() => fetchMonitorData(targetIp), 5000);
    }
};

window.fetchMonitorData = async function(ip) {
    try {
        // Gọi API Backend (Bạn sẽ cần viết endpoint này trong FastAPI sau)
        const response = await fetch(`/api/monitor?ip=${ip}`);
        if (!response.ok) return;
        const data = await response.json();
        
        // 1. Cập nhật CPU
        if (data.cpu !== undefined) {
            document.getElementById('mon-cpu-text').innerText = data.cpu + '%';
            document.getElementById('mon-cpu-bar').style.width = data.cpu + '%';
            // Đổi màu thanh CPU nếu quá tải
            document.getElementById('mon-cpu-bar').className = data.cpu > 80 
                ? 'progress-bar bg-danger progress-bar-striped progress-bar-animated' 
                : 'progress-bar bg-primary progress-bar-striped progress-bar-animated';
        }
        
        // 2. Cập nhật RAM
        if (data.ram_percent !== undefined) {
            document.getElementById('mon-ram-text').innerText = data.ram_percent + '%';
            document.getElementById('mon-ram-bar').style.width = data.ram_percent + '%';
            document.getElementById('mon-ram-detail').innerText = `${data.ram_used} / ${data.ram_total} MB`;
        }
        
        // 3. Cập nhật Uptime & Temp
        if (data.uptime) document.getElementById('mon-uptime').innerText = data.uptime;
        if (data.temp) document.getElementById('mon-temp').innerText = data.temp + ' °C';

        // 4. In Syslog mới ra màn hình Terminal giả lập
        if (data.syslogs && data.syslogs.length > 0) {
            const syslogBox = document.getElementById('mon-syslog');
            
            // Xóa dòng "Đang chờ..." nếu là lần đầu có log
            if(syslogBox.innerHTML.includes("Đang chờ tín hiệu")) syslogBox.innerHTML = '';

            data.syslogs.forEach(log => {
                const span = document.createElement('span');
                // Tô màu log tự động dựa trên từ khóa hệ thống Cisco
                if (log.includes('%SYS-') || log.includes('-ERR-') || log.includes('DOWN')) {
                    span.className = 'text-danger fw-bold';
                } else if (log.includes('-WARN-')) {
                    span.className = 'text-warning';
                } else if (log.includes('UPDOWN') || log.includes('UP')) {
                    span.className = 'text-success';
                } else {
                    span.className = 'text-light';
                }
                
                span.innerText = `[${new Date().toLocaleTimeString()}] ${log}`;
                syslogBox.appendChild(span);
                syslogBox.appendChild(document.createElement('br'));
            });
            // Tự động cuộn xuống dưới cùng để xem log mới nhất
            syslogBox.scrollTop = syslogBox.scrollHeight;
        }

    } catch (error) {
        console.error("Mất kết nối với Router hoặc API Backend:", error);
    }
};
