// ==========================================
// HÀM KHỞI CHẠY KHI TẢI TRANG
// ==========================================
window.onload = function() {
    // Module 0 & 1
    if (typeof addInterfaceRow === "function") addInterfaceRow();
    if (typeof addSubInterfaceRow === "function") addSubInterfaceRow();

    // Module 2: OSPF & BGP
    if (typeof addOspfNetworkRow === "function") addOspfNetworkRow();
    if (typeof addOspfInterfaceRow === "function") addOspfInterfaceRow();
    if (typeof addOspfSummaryRow === "function") addOspfSummaryRow();
    if (typeof addBgpNeighborRow === "function") addBgpNeighborRow();

    // Module 3 & 4
    if (typeof addVpnTunnelRow === "function") addVpnTunnelRow();
    if (typeof addNatStaticRow === "function") addNatStaticRow();
    if (typeof addQosClassRow === "function") addQosClassRow();
};

// ==========================================
// HÀM TIỆN ÍCH CHUNG
// ==========================================
function openTab(evt, tabName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) { tabcontent[i].style.display = "none"; }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) { tablinks[i].className = tablinks[i].className.replace(" active", ""); }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}

async function callAPI(endpoint, data, btnId) {
    const btn = document.getElementById(btnId);
    const termBox = document.getElementById('terminal-box');
    const originalText = btn.innerText;

    btn.innerText = "⏳ Đang xử lý...";
    btn.style.background = "#f39c12";
    termBox.style.display = "block";
    termBox.style.color = "#4af626";
    termBox.innerText = "Đang gửi lệnh xuống thiết bị mạng...\nĐợi một lát nhé...";

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();

        if(result.status === 'success') {
            termBox.innerText = "✅ THÀNH CÔNG!\n\n" + result.ansible_log;
        } else {
            termBox.style.color = "#ff4d4d";
            termBox.innerText = "❌ CÓ LỖI XẢY RA:\n\n" + result.ansible_log;
        }
    } catch (error) {
        termBox.style.color = "#ff4d4d";
        termBox.innerText = "❌ Lỗi kết nối tới Server API!";
    }

    btn.innerText = originalText;
    btn.style.background = "#28a745";
}
// ==========================================
// MODULE 0: CƠ BẢN
// ==========================================
function addInterfaceRow() {
    const container = document.getElementById('interfaces-container');
    const row = document.createElement('div');
    row.className = 'interface-row';
    // Dùng flexbox để căn chỉnh các ô trên cùng 1 hàng cho đẹp
    row.style.cssText = 'display: flex; gap: 10px; margin-bottom: 10px; align-items: center;';
    
    // Đã thay thế ô nhập text cũ bằng thẻ <select> và ô nhập ID nhỏ
    row.innerHTML = `
        <div style="display: flex; flex: 1.2; gap: 5px;">
            <select class="int-prefix" style="flex: 2; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
                <option value="GigabitEthernet">GigabitEthernet</option>
                <option value="FastEthernet">FastEthernet</option>
                <option value="Ethernet">Ethernet</option>
                <option value="Serial">Serial</option>
                <option value="Loopback">Loopback</option>
            </select>
            <input type="text" class="int-id" placeholder="VD: 0/0" value="0/0" style="flex: 1; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
        </div>
        <input type="text" class="int-ip" placeholder="Địa chỉ IP" value="192.168.1.1" style="flex: 1; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
        <input type="text" class="int-mask" placeholder="Subnet Mask" value="255.255.255.0" style="flex: 1; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
        <button type="button" class="btn-danger" onclick="this.parentElement.remove()" title="Xóa cổng này" style="padding: 8px 12px;">X</button>
    `;
    container.appendChild(row);
}

function sendModule0() {
    const interfaceList = [];
    document.querySelectorAll('.interface-row').forEach(row => {
        // Lấy loại cổng (VD: FastEthernet) và ID (VD: 0/0) rồi ghép lại với nhau
        const prefix = row.querySelector('.int-prefix').value;
        const id = row.querySelector('.int-id').value.trim();
        const fullName = prefix + id; // Kết quả: "FastEthernet0/0"
        
        const ip = row.querySelector('.int-ip').value.trim();
        const mask = row.querySelector('.int-mask').value.trim();
        
        // Đẩy vào danh sách nếu có nhập ID và IP
        if (id !== "" && ip !== "") {
            interfaceList.push({ "name": fullName, "ip": ip, "mask": mask });
        }
    });
    
    const targetIp = document.getElementById('target_router_ip').value.trim();
    if (!targetIp) {
        alert("⚠️ Vui lòng nhập 'Địa chỉ IP Router' ở trên cùng trước khi chạy cấu hình!");
        return;
    }

    const data = {
        target_ip: targetIp,
        basic: {
            hostname: document.getElementById('m0_hostname').value,
            admin_user: document.getElementById('m0_admin').value,
            admin_pass: "cisco123",
            domain_name: document.getElementById('m0_domain').value,
            transport: "ssh telnet",
            ssh_version: 2,
            ssh_key_size: 2048,
            interfaces: interfaceList
        }
    };
    callAPI('/api/config/basic', data, 'btn-mod0');
}



// ==========================================
// CÁC HÀM TẠO GIAO DIỆN MODULE 1
// ==========================================

function addNtpRow() {
    const container = document.getElementById('ntp-container');
    if (!container) return;
    const row = document.createElement('div');
    row.className = 'ntp-row form-grid';
    row.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 15px; margin-top: 10px; padding: 15px; background: #ffffff; border: 1px solid #a9cce3; border-left: 4px solid #2980b9; border-radius: 5px; position: relative;';

    row.innerHTML = `
        <div class="form-group"><label>Vai trò (Role):</label>
            <select class="ntp-role" style="width: 100%;" onchange="toggleNtpFields(this)">
                <option value="client">Client (Trỏ tới Server)</option>
                <option value="master">Master Server (Phát NTP)</option>
                <option value="peer">Peer (Đồng bộ ngang hàng)</option>
                <option value="broadcast">Broadcast (Trên Cổng)</option>
                <option value="multicast">Multicast (Trên Cổng)</option>
            </select>
        </div>
        <div class="form-group ntp-ip-box"><label>IP (Server/Peer/Group):</label><input type="text" class="ntp-ip" placeholder="VD: 8.8.8.8" style="width: 100%;"></div>
        <div class="form-group ntp-stratum-box" style="display: none;"><label>Stratum (1-15):</label><input type="number" class="ntp-stratum" value="8" style="width: 100%;"></div>
        <div class="form-group ntp-int-box" style="display: none;"><label>Cổng áp dụng:</label><input type="text" class="ntp-int" placeholder="VD: G0/0" style="width: 100%;"></div>
        <div class="form-group ntp-dir-box" style="display: none;"><label>Hành động:</label>
            <select class="ntp-dir" style="width: 100%;"><option value="send">Send (Phát)</option><option value="receive">Receive (Nhận)</option></select>
        </div>
        <button type="button" style="position: absolute; right: 10px; top: 10px; padding: 4px 10px; background: #e74c3c; color: white; border: none; cursor: pointer;" onclick="this.parentElement.remove()">X</button>
    `;
    container.appendChild(row);
}

function toggleNtpFields(selectElem) {
    const row = selectElem.closest('.ntp-row');
    const role = selectElem.value;

    const ipBox = row.querySelector('.ntp-ip-box');
    const stratumBox = row.querySelector('.ntp-stratum-box');
    const intBox = row.querySelector('.ntp-int-box');
    const dirBox = row.querySelector('.ntp-dir-box');

    ipBox.style.display = 'none';
    stratumBox.style.display = 'none';
    intBox.style.display = 'none';
    dirBox.style.display = 'none';

    if (role === 'client' || role === 'peer') {
        ipBox.style.display = 'block';
    } else if (role === 'master') {
        stratumBox.style.display = 'block';
    } else if (role === 'broadcast') {
        intBox.style.display = 'block';
        dirBox.style.display = 'block';
    } else if (role === 'multicast') {
        intBox.style.display = 'block';
        dirBox.style.display = 'block';
        ipBox.style.display = 'block';
    }
}

function addSubInterfaceRow() {
    const container = document.getElementById('subint-container');
    if (!container) return;
    const row = document.createElement('div');
    row.className = 'subint-row';
    row.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-top: 10px; padding: 15px; background: #ffffff; border: 1px solid #d1f2eb; border-left: 4px solid #1abc9c; border-radius: 5px; position: relative;';
    row.innerHTML = `
        <div class="form-group"><label>Sub-interface:</label><input type="text" class="sub-name" placeholder="VD: G0/1.10" style="width: 100%;"></div>
        <div class="form-group"><label>VLAN ID:</label><input type="number" class="sub-vlan" placeholder="VD: 10" style="width: 100%;"></div>
        <div class="form-group"><label>IP Sub-interface:</label><input type="text" class="sub-ip" placeholder="VD: 10.10.10.2" style="width: 100%;"></div>
        <button type="button" style="position: absolute; right: 10px; top: 10px; padding: 4px 10px; background: #e74c3c; color: white; border: none; cursor: pointer;" onclick="this.parentElement.remove()">X</button>
    `;
    container.appendChild(row);
}

function addHsrpRow() {
    const container = document.getElementById('hsrp-container');
    if (!container) return;
    const row = document.createElement('div');
    row.className = 'hsrp-row';
    row.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 15px; margin-top: 10px; padding: 15px; background: #ffffff; border: 1px solid #fae5d3; border-left: 4px solid #e67e22; border-radius: 5px; position: relative;';
    row.innerHTML = `
        <div class="form-group"><label>Cổng áp dụng:</label><input type="text" class="hsrp-int" placeholder="VD: G0/1.10" style="width: 100%;"></div>
        <div class="form-group"><label>HSRP Group:</label><input type="number" class="hsrp-grp" placeholder="VD: 10" style="width: 100%;"></div>
        <div class="form-group"><label>Virtual IP (VIP):</label><input type="text" class="hsrp-vip" placeholder="VD: 10.10.10.1" style="width: 100%;"></div>
        <div class="form-group"><label>Priority:</label><input type="number" class="hsrp-pri" placeholder="VD: 110" style="width: 100%;"></div>
        <button type="button" style="position: absolute; right: 10px; top: 10px; padding: 4px 10px; background: #e74c3c; color: white; border: none; cursor: pointer;" onclick="this.parentElement.remove()">X</button>
    `;
    container.appendChild(row);
}

// ==========================================
// HÀM GOM DỮ LIỆU ĐÓNG GÓI JSON - MODULE 1
// ==========================================
function sendModule1() {
    // 1. Thu thập dữ liệu NTP (Đã fix lỗi thiếu stratum)
    const ntpList = [];
    document.querySelectorAll('.ntp-row').forEach(row => {
        const role = row.querySelector('.ntp-role').value;
        
        // CHỈNH SỬA Ở ĐÂY: Khai báo sẵn stratum (mặc định là 8) cho tất cả các role để Python không báo lỗi missing
        let stratumVal = 8;
        const stratumInput = row.querySelector('.ntp-stratum');
        if (stratumInput) {
             stratumVal = parseInt(stratumInput.value) || 8;
        }

        // Đóng gói mặc định luôn có stratum
        const ntpItem = { 
            "role": role,
            "stratum": stratumVal 
        };
        
        let isValid = false;

        if (role === 'client' || role === 'peer') {
            const ip = row.querySelector('.ntp-ip').value.trim();
            if (ip !== "") { 
                ntpItem["ip_address"] = ip;
                isValid = true;
            }
        } else if (role === 'master') {
            isValid = true; 
        } else if (role === 'broadcast') {
            const intf = row.querySelector('.ntp-int').value.trim();
            if (intf !== "") { 
                ntpItem["interface"] = intf;
                ntpItem["direction"] = row.querySelector('.ntp-dir').value;
                isValid = true;
            }
        } else if (role === 'multicast') {
            const ip = row.querySelector('.ntp-ip').value.trim();
            const intf = row.querySelector('.ntp-int').value.trim();
            if (ip !== "" && intf !== "") { 
                ntpItem["ip_address"] = ip;
                ntpItem["interface"] = intf;
                ntpItem["direction"] = row.querySelector('.ntp-dir').value;
                isValid = true;
            }
        }

        if (isValid) {
            ntpList.push(ntpItem);
        }
    });

    // 2. Thu thập dữ liệu Sub-interface
    const subIntList = [];
    document.querySelectorAll('.subint-row').forEach(row => {
        const name = row.querySelector('.sub-name').value.trim();
        const ip = row.querySelector('.sub-ip').value.trim();
        const vlan = parseInt(row.querySelector('.sub-vlan').value) || 0;
        if (name !== "" && ip !== "") {
            subIntList.push({ "name": name, "vlan_id": vlan, "ip": ip, "mask": "255.255.255.0" });
        }
    });

    // 3. Thu thập dữ liệu HSRP độc lập
    const hsrpList = [];
    document.querySelectorAll('.hsrp-row').forEach(row => {
        const intName = row.querySelector('.hsrp-int').value.trim();
        const grp = parseInt(row.querySelector('.hsrp-grp').value) || 0;
        const vip = row.querySelector('.hsrp-vip').value.trim();
        const pri = parseInt(row.querySelector('.hsrp-pri').value) || 100;
        if (intName !== "" && vip !== "") {
            // Sửa lại thành tên gốc (bỏ chữ hsrp_)
            hsrpList.push({ 
                "interface": intName, 
                "group": grp, 
                "vip": vip, 
                "priority": pri 
            });
        }
    });
    const targetIp = document.getElementById('target_router_ip').value.trim();
    if (!targetIp) {
        alert("⚠️ Vui lòng nhập 'Địa chỉ IP Router' ở trên cùng trước khi chạy cấu hình!");
        return;
    }

    // ĐÓNG GÓI JSON
    const data = {
        target_ip: targetIp,
        ntp: ntpList,
        sub_interfaces: subIntList,
        hsrp: hsrpList
    };

    console.log("📦 Dữ liệu Module 1:", data);
    callAPI('/api/config/module1-lan', data, 'btn-mod1');
}

// ==========================================
// MODULE 2: OSPF & BGP (Đã cập nhật chuẩn UI mới)
// ==========================================
function addOspfNetworkRow() {
    const container = document.getElementById('ospf-network-container');
    if (!container) return;
    const row = document.createElement('div');
    row.className = 'ospf-net-row form-grid';
    row.style.cssText = 'border-left: 3px solid #ff7043; padding-left: 10px; margin-bottom: 10px; position: relative; background: #fff; padding: 10px; border-radius: 4px;';
    row.innerHTML = `
        <div class="form-group"><label>Network IP</label><input type="text" class="ospf-ip form-control" placeholder="VD: 10.0.0.0"></div>
        <div class="form-group"><label>Wildcard Mask</label><input type="text" class="ospf-wild form-control" placeholder="VD: 0.0.0.255"></div>
        <div class="form-group"><label>Area ID</label><input type="number" class="ospf-area form-control" value="0"></div>
        <div class="form-group"><label>Area Type</label><select class="ospf-area-type form-select"><option value="standard">Standard</option><option value="stub">Stub</option><option value="nssa">NSSA</option></select></div>
        <button type="button" class="btn btn-danger btn-sm" style="position: absolute; right: 10px; top: 10px;" onclick="this.parentElement.remove()">X</button>
    `;
    container.appendChild(row);
}

// 1. Thêm dòng Active Interface (Thay thế cho passive checkbox cũ)
function addOspfActiveRow() {
    const container = document.getElementById('ospf-active-container');
    if (!container) return;
    const row = document.createElement('div');
    row.className = 'ospf-active-row row mb-2 align-items-center';
    row.innerHTML = `
        <div class="col-10">
            <input type="text" class="form-control form-control-sm ospf-active-name" placeholder="VD: GigabitEthernet0/0">
        </div>
        <div class="col-2">
            <button type="button" class="btn btn-danger btn-sm w-100 fw-bold" onclick="this.parentElement.parentElement.remove()">X</button>
        </div>
    `;
    container.appendChild(row);
}

// 2. Tùy chỉnh Cổng & Tích hợp Authentication (Xác thực) trực tiếp trên dòng
function addOspfInterfaceRow() {
    const container = document.getElementById('ospf-interface-container');
    if (!container) return;
    const row = document.createElement('div');
    row.className = 'ospf-int-row card mb-3 border-0 shadow-sm border-start border-3 border-danger';
    row.innerHTML = `
        <div class="card-body position-relative bg-white p-3">
            <button type="button" class="btn btn-danger btn-sm position-absolute top-0 end-0 m-2 px-2 py-0 shadow-sm" onclick="this.closest('.card').remove()">X</button>
            
            <div class="row mb-3 pe-4">
                <div class="col-md-6 mb-2 mb-md-0">
                    <label class="form-label small fw-bold text-dark">Tên Cổng (Interface)</label>
                    <input type="text" class="form-control ospf-int-name" placeholder="VD: G0/0">
                </div>
                <div class="col-md-6">
                    <label class="form-label small fw-bold text-dark">Network Type</label>
                    <select class="form-select ospf-net-type">
                        <option value="">Mặc định</option>
                        <option value="point-to-point">Point-to-Point</option>
                        <option value="broadcast">Broadcast</option>
                    </select>
                </div>
            </div>
            
            <div class="row align-items-end pe-4">
                <div class="col-md-4 mb-2 mb-md-0">
                    <label class="form-label small fw-bold text-dark">Cost</label>
                    <input type="number" class="form-control ospf-cost" placeholder="Mặc định">
                </div>
                <div class="col-md-4 mb-2 mb-md-0">
                    <label class="form-label small fw-bold text-dark">Kiểu Xác Thực (Authen)</label>
                    <select class="form-select border-primary ospf-authen-type">
                        <option value="">Không có</option>
                        <option value="message-digest">MD5</option>
                        <option value="text">Clear Text</option>
                    </select>
                </div>
                <div class="col-md-4">
                    <label class="form-label small fw-bold text-dark">Key / Password</label>
                    <input type="text" class="form-control ospf-authen-key" placeholder="VD (MD5): 1 cisco123">
                </div>
            </div>
        </div>
    `;
    container.appendChild(row);
}

function addOspfSummaryRow() {
    const container = document.getElementById('ospf-summary-container');
    if (!container) return;
    const row = document.createElement('div');
    row.className = 'ospf-sum-row card mb-2 border-0 shadow-sm border-start border-3 border-primary p-2 bg-white';
    row.innerHTML = `
        <div class="position-relative">
            <button type="button" class="btn btn-danger btn-sm position-absolute top-0 end-0 px-2 py-0" onclick="this.closest('.card').remove()">X</button>
            <div class="row pe-4">
                <div class="col-md-4 mb-1">
                    <label class="form-label small fw-bold text-muted">Area ID</label>
                    <input type="number" class="ospf-sum-area form-control form-control-sm" value="1">
                </div>
                <div class="col-md-4 mb-1">
                    <label class="form-label small fw-bold text-muted">Summary IP</label>
                    <input type="text" class="ospf-sum-ip form-control form-control-sm" placeholder="VD: 192.168.0.0">
                </div>
                <div class="col-md-4 mb-1">
                    <label class="form-label small fw-bold text-muted">Subnet Mask</label>
                    <input type="text" class="ospf-sum-mask form-control form-control-sm" placeholder="VD: 255.255.252.0">
                </div>
            </div>
        </div>
    `;
    container.appendChild(row);
}

function addBgpNeighborRow() {
    const container = document.getElementById('bgp-neighbor-container');
    if (!container) return;
    const row = document.createElement('div');
    row.className = 'bgp-neigh-row form-grid';
    row.style.cssText = 'border-left: 3px solid #2980b9; padding-left: 10px; margin-bottom: 10px; position: relative; background: #fff; padding: 10px; border-radius: 4px;';
    row.innerHTML = `
        <div class="form-group"><label>Neighbor IP</label><input type="text" class="bgp-ip form-control" placeholder="VD: 2.2.2.2"></div>
        <div class="form-group"><label>Remote AS</label><input type="number" class="bgp-as form-control" placeholder="VD: 65001"></div>
        <button type="button" class="btn btn-danger btn-sm" style="position: absolute; right: 10px; top: 10px;" onclick="this.parentElement.remove()">X</button>
    `;
    container.appendChild(row);
}

function sendModule2() {
    const ospfNetworks = [];
    document.querySelectorAll('.ospf-net-row').forEach(row => {
        const ip = row.querySelector('.ospf-ip').value.trim();
        const wild = row.querySelector('.ospf-wild').value.trim();
        if (ip && wild) ospfNetworks.push({ "ip": ip, "wildcard": wild, "area": parseInt(row.querySelector('.ospf-area').value) || 0, "area_type": row.querySelector('.ospf-area-type').value });
    });

    // Thu thập danh sách Active Interfaces (Cổng ngoại lệ không dùng passive default)
    const ospfActiveInterfaces = [];
    document.querySelectorAll('.ospf-active-row').forEach(row => {
        const intName = row.querySelector('.ospf-active-name').value.trim();
        if (intName) ospfActiveInterfaces.push(intName);
    });

    // Thu thập cấu hình chi tiết từng cổng (Cost, Network Type, Authentication)
    const ospfInterfaces = [];
    document.querySelectorAll('.ospf-int-row').forEach(row => {
        const intName = row.querySelector('.ospf-int-name').value.trim();
        if (intName) {
            ospfInterfaces.push({
                "interface_name": intName,
                "network_type": row.querySelector('.ospf-net-type').value,
                "cost": row.querySelector('.ospf-cost').value ? parseInt(row.querySelector('.ospf-cost').value) : null,
                "authen_type": row.querySelector('.ospf-authen-type').value,
                "authen_key": row.querySelector('.ospf-authen-key').value.trim()
            });
        }
    });

    const ospfSummaries = [];
    document.querySelectorAll('.ospf-sum-row').forEach(row => {
        const ip = row.querySelector('.ospf-sum-ip').value.trim();
        const mask = row.querySelector('.ospf-sum-mask').value.trim();
        if (ip && mask) ospfSummaries.push({ "area": parseInt(row.querySelector('.ospf-sum-area').value) || 0, "ip": ip, "mask": mask });
    });

    const bgpNeighbors = [];
    document.querySelectorAll('.bgp-neigh-row').forEach(row => {
        const ip = row.querySelector('.bgp-ip').value.trim();
        const remoteAs = parseInt(row.querySelector('.bgp-as').value);
        if (ip && !isNaN(remoteAs)) bgpNeighbors.push({ "ip": ip, "remote_as": remoteAs });
    });

    const targetIp = document.getElementById('target_router_ip').value.trim();
    if (!targetIp) {
        alert("⚠️ Vui lòng nhập 'Địa chỉ IP Router' ở trên cùng trước khi chạy cấu hình!");
        return;
    }

    const data = {
        target_ip: targetIp,
        ospf: {
            process_id: parseInt(document.getElementById('m2_ospf_pid').value) || 1,
            router_id: document.getElementById('m2_ospf_rid').value.trim(),
            redistribute: document.getElementById('m2_ospf_redist').value,
            networks: ospfNetworks,
            active_interfaces: ospfActiveInterfaces, // Gửi danh sách cổng active lên Backend
            interfaces: ospfInterfaces,              // Gửi cấu hình Cost & Authen của cổng
            summaries: ospfSummaries
        },
        bgp: {
            local_as: parseInt(document.getElementById('m2_bgp_as').value) || 65000,
            router_id: document.getElementById('m2_bgp_rid').value.trim(),
            redistribute: document.getElementById('m2_bgp_redist').value,
            summary_ip: document.getElementById('m2_bgp_sum_ip').value.trim(),
            summary_mask: document.getElementById('m2_bgp_sum_mask').value.trim(),
            neighbors: bgpNeighbors
        }
    };
    
    console.log("📦 Dữ liệu Module 2:", data);
    callAPI('/api/config/module2-routing', data, 'btn-mod2');
}

// ==========================================
// MODULE 3: VPN, DMVPN & WAN
// ==========================================
function addVpnTunnelRow() {
    const container = document.getElementById('vpn-tunnel-container');
    if (!container) return;
    const row = document.createElement('div');
    row.className = 'vpn-tunnel-row';
    row.style.cssText = 'background: #ffffff; border: 1px solid #a3e4d7; border-left: 4px solid #1abc9c; padding: 15px; margin-bottom: 15px; border-radius: 5px; position: relative;';

    row.innerHTML = `
        <div class="form-grid" style="margin-bottom: 10px;">
            <div class="form-group"><label>Tên Tunnel (VD: Tunnel0)</label><input type="text" class="vpn-tun-name" value="Tunnel0"></div>
            <div class="form-group"><label>IP Tunnel</label><input type="text" class="vpn-tun-ip" placeholder="VD: 172.16.0.1"></div>
            <div class="form-group"><label>Subnet Mask</label><input type="text" class="vpn-tun-mask" value="255.255.255.0"></div>
            <div class="form-group"><label>Nguồn (Tunnel Source)</label><input type="text" class="vpn-tun-src" placeholder="VD: G0/0"></div>
        </div>
        <div class="form-grid" style="margin-bottom: 10px; border-top: 1px dashed #d1f2eb; padding-top: 10px;">
            <div class="form-group"><label>Chế độ Tunnel (Mode)</label>
                <select class="vpn-tun-mode"><option value="gre ip">GRE Point-to-Point</option><option value="gre multipoint">DMVPN</option></select>
            </div>
            <div class="form-group"><label>Đích (Chỉ dùng cho GRE P2P)</label><input type="text" class="vpn-tun-dst" placeholder="IP Đích"></div>
            <div class="form-group"><label>NHRP Network ID (DMVPN)</label><input type="number" class="vpn-tun-nhrp-id" placeholder="VD: 1"></div>
            <div class="form-group"><label>NHRP NHS IP (IP Hub)</label><input type="text" class="vpn-tun-nhrp-nhs" placeholder="Dành cho Spoke"></div>
        </div>
        <div style="display: flex; align-items: center; border-top: 1px dashed #d1f2eb; padding-top: 10px;">
            <label style="cursor: pointer; font-weight: bold; color: #c0392b;"><input type="checkbox" class="vpn-tun-ipsec" checked style="width: auto; margin-right: 5px;"> Bọc IPsec Profile</label>
        </div>
        <button type="button" class="btn-danger" style="position: absolute; right: 10px; top: 10px; padding: 4px 10px;" onclick="this.parentElement.remove()">X</button>
    `;
    container.appendChild(row);
}

function sendModule3() {
    const tunnels = [];
    document.querySelectorAll('.vpn-tunnel-row').forEach(row => {
        const name = row.querySelector('.vpn-tun-name').value.trim();
        const ip = row.querySelector('.vpn-tun-ip').value.trim();
        if (name && ip) {
            tunnels.push({
                "name": name,
                "ip": ip,
                "mask": row.querySelector('.vpn-tun-mask').value.trim(),
                "source": row.querySelector('.vpn-tun-src').value.trim(),
                "mode": row.querySelector('.vpn-tun-mode').value,
                "destination": row.querySelector('.vpn-tun-dst').value.trim() || null,
                "nhrp_network_id": parseInt(row.querySelector('.vpn-tun-nhrp-id').value) || null,
                "nhrp_nhs_ip": row.querySelector('.vpn-tun-nhrp-nhs').value.trim() || null,
                "apply_ipsec": row.querySelector('.vpn-tun-ipsec').checked
            });
        }
    });

    const ikeKeyInput = document.getElementById('m3_ike_key');

    const targetIp = document.getElementById('target_router_ip').value.trim();
    if (!targetIp) {
        alert("⚠️ Vui lòng nhập 'Địa chỉ IP Router' ở trên cùng trước khi chạy cấu hình!");
        return;
    }
    const data = {
        target_ip: targetIp,
        ipsec_global: {
            isakmp_policy: parseInt(document.getElementById('m3_ike_id').value) || 10,
            preshared_key: ikeKeyInput ? ikeKeyInput.value.trim() : "",
            encryption: document.getElementById('m3_ike_encr').value,
            dh_group: parseInt(document.getElementById('m3_ike_dh').value) || 14,
            transform_set: document.getElementById('m3_ipsec_ts').value.trim(),
            ipsec_profile: document.getElementById('m3_ipsec_prof').value.trim()
        },
        tunnels: tunnels
    };

    console.log("📦 Dữ liệu Module 3:", data);
    callAPI('/api/config/module3-vpn', data, 'btn-mod3');
}


// ==========================================
// MODULE 4: NAT & QOS
// ==========================================
function addNatStaticRow() {
    const container = document.getElementById('nat-static-container');
    if (!container) return;
    const row = document.createElement('div');
    row.className = 'nat-static-row form-grid';
    row.style.cssText = 'border-left: 3px solid #9b59b6; padding-left: 10px; margin-bottom: 10px; position: relative;';
    row.innerHTML = `
        <div class="form-group"><label>IP Inside (Server)</label><input type="text" class="nat-in-ip" placeholder="VD: 192.168.1.10"></div>
        <div class="form-group"><label>IP Outside (Public)</label><input type="text" class="nat-out-ip" placeholder="VD: 8.8.8.8"></div>
        <div class="form-group"><label>Port (Bỏ trống nếu NAT full)</label><input type="number" class="nat-port" placeholder="VD: 80"></div>
        <button type="button" class="btn-danger" style="position: absolute; right: -10px; top: 30px; padding: 2px 8px;" onclick="this.parentElement.remove()">X</button>
    `;
    container.appendChild(row);
}

function addQosClassRow() {
    const container = document.getElementById('qos-class-container');
    if (!container) return;
    const row = document.createElement('div');
    row.className = 'qos-class-row form-grid';
    row.style.cssText = 'border-left: 3px solid #34495e; padding-left: 10px; margin-bottom: 10px; position: relative;';
    row.innerHTML = `
        <div class="form-group"><label>Tên Class</label><input type="text" class="qos-cname" placeholder="VD: VOICE"></div>
        <div class="form-group"><label>Điều kiện Match</label><input type="text" class="qos-match" placeholder="VD: dscp ef"></div>
        <div class="form-group"><label>Hành động Policy</label>
            <select class="qos-action"><option value="priority percent">Priority %</option><option value="bandwidth percent">Bandwidth %</option><option value="police">Police bps</option></select>
        </div>
        <div class="form-group"><label>Giá trị</label><input type="number" class="qos-val" placeholder="VD: 30"></div>
        <button type="button" class="btn-danger" style="position: absolute; right: -10px; top: 30px; padding: 2px 8px;" onclick="this.parentElement.remove()">X</button>
    `;
    container.appendChild(row);
}


function sendModule4() {
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
        const action = row.querySelector('.qos-action').value;
        const val = parseInt(row.querySelector('.qos-val').value);
        if (name && match) qosClasses.push({ class_name: name, match: match, action: action, value: isNaN(val) ? 0 : val });
    });

    const targetIp = document.getElementById('target_router_ip').value.trim();
    if (!targetIp) {
        alert("⚠️ Vui lòng nhập 'Địa chỉ IP Router' ở trên cùng trước khi chạy cấu hình!");
        return;
    }
    const data = {
        target_ip: targetIp,
        nat: {
            dynamic: {
                acl_name: document.getElementById('m4_nat_acl').value.trim(),
                network: document.getElementById('m4_nat_net').value.trim(),
                wildcard: document.getElementById('m4_nat_wild').value.trim(),
                outside_interface: document.getElementById('m4_nat_out_int').value.trim()
            },
            static: staticNat
        },
        qos: {
            policy_name: document.getElementById('m4_qos_policy').value.trim(),
            apply_interface: document.getElementById('m4_qos_int').value.trim(),
            classes: qosClasses
        }
    };
    console.log("📦 Dữ liệu Module 4:", data);
    callAPI('/api/config/module4-nat-qos', data, 'btn-mod4');
}


// ==========================================
// CÁC HÀM XỬ LÝ GIAO DIỆN (UI) CHO MODULE NAT
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    
    // 1. Lắng nghe sự kiện thêm Cổng Inside
    const btnAddInside = document.getElementById('btn_add_inside');
    if (btnAddInside) {
        btnAddInside.addEventListener('click', function() {
            const container = document.getElementById('inside-int-container');
            const row = document.createElement('div');
            row.className = 'row mb-2 inside-row align-items-center';
            row.innerHTML = `
                <div class="col-10">
                    <input type="text" class="form-control" placeholder="VD: GigabitEthernet0/0">
                </div>
                <div class="col-2">
                    <button type="button" class="btn btn-danger w-100 fw-bold btn-remove-int">X</button>
                </div>
            `;
            container.appendChild(row);
        });
    }

    // 2. Lắng nghe sự kiện thêm Cổng Outside
    const btnAddOutside = document.getElementById('btn_add_outside');
    if (btnAddOutside) {
        btnAddOutside.addEventListener('click', function() {
            const container = document.getElementById('outside-int-container');
            const row = document.createElement('div');
            row.className = 'row mb-2 outside-row align-items-center';
            row.innerHTML = `
                <div class="col-10">
                    <input type="text" class="form-control" placeholder="VD: GigabitEthernet0/1">
                </div>
                <div class="col-2">
                    <button type="button" class="btn btn-danger w-100 fw-bold btn-remove-int">X</button>
                </div>
            `;
            container.appendChild(row);
        });
    }

    // 3. Sự kiện Ủy quyền cho nút "Xóa" cổng (Bắt buộc dùng cách này cho thẻ tạo động)
    document.addEventListener('click', function(e) {
        if (e.target && e.target.classList.contains('btn-remove-int')) {
            e.target.closest('.row').remove();
        }
    });

    // 4. Lắng nghe thay đổi Loại ACL để Ẩn/Hiện Form
    const aclSelect = document.getElementById('acl_type_select');
    if (aclSelect) {
        aclSelect.addEventListener('change', function() {
            const extFields = document.getElementById('acl_extended_fields');
            const protocolCol = document.getElementById('acl_protocol_col');
            
            if (this.value === 'extended') {
                extFields.classList.remove('d-none');
                protocolCol.classList.remove('d-none');
            } else {
                extFields.classList.add('d-none');
                protocolCol.classList.add('d-none');
            }
        });
    }

    // 5. Lắng nghe thay đổi Loại NAT để Ẩn/Hiện Form
    const natSelect = document.getElementById('nat_type_select');
    if (natSelect) {
        natSelect.addEventListener('change', function() {
            const overloadForm = document.getElementById('nat_overload_form');
            const staticForm = document.getElementById('nat_static_form');
            
            if (this.value === 'overload') {
                overloadForm.classList.remove('d-none');
                staticForm.classList.add('d-none');
            } else {
                overloadForm.classList.add('d-none');
                staticForm.classList.remove('d-none');
            }
        });
    }
});

// ==========================================
// ĐỒNG BỘ GIAO DIỆN CÁC FORM MODULE 2
// ==========================================

// 1. Form Summary (Dàn ngang, viền xanh lơ)
window.addOspfSummaryRow = function() {
    const container = document.getElementById('ospf-summary-container');
    if (!container) return;
    const row = document.createElement('div');
    row.className = 'ospf-sum-row card mb-3 border-0 shadow-sm';
    row.innerHTML = `
        <div class="card-body position-relative border-start border-3 border-info p-3 bg-white">
            <!-- Nút X góc phải -->
            <button type="button" class="btn btn-danger btn-sm position-absolute top-0 end-0 m-1 rounded-0 px-2" onclick="this.closest('.card').remove()" title="Xóa">X</button>
            
            <!-- Dàn ngang các ô nhập liệu -->
            <div class="row align-items-end pt-2 pe-3">
                <div class="col-md-4 mb-2 mb-md-0">
                    <label class="form-label small fw-bold text-muted">Area ID</label>
                    <input type="number" class="ospf-sum-area form-control" value="1">
                </div>
                <div class="col-md-4 mb-2 mb-md-0">
                    <label class="form-label small fw-bold text-muted">Summary IP</label>
                    <input type="text" class="ospf-sum-ip form-control" placeholder="VD: 192.168.0.0">
                </div>
                <div class="col-md-4 mb-2 mb-md-0">
                    <label class="form-label small fw-bold text-muted">Subnet Mask</label>
                    <input type="text" class="ospf-sum-mask form-control" placeholder="VD: 255.255.252.0">
                </div>
            </div>
        </div>
    `;
    container.appendChild(row);
};

// 2. Form Khai báo Network (Dàn ngang, viền cam)
window.addOspfNetworkRow = function() {
    const container = document.getElementById('ospf-network-container');
    if (!container) return;
    const row = document.createElement('div');
    row.className = 'ospf-net-row card mb-3 border-0 shadow-sm';
    row.innerHTML = `
        <div class="card-body position-relative border-start border-3 border-warning p-3 bg-white">
            <button type="button" class="btn btn-danger btn-sm position-absolute top-0 end-0 m-1 rounded-0 px-2" onclick="this.closest('.card').remove()" title="Xóa">X</button>
            <div class="row align-items-end pt-2 pe-3">
                <div class="col-md-4 mb-2 mb-md-0">
                    <label class="form-label small fw-bold text-muted">Network IP</label>
                    <input type="text" class="ospf-ip form-control" placeholder="VD: 10.0.0.0">
                </div>
                <div class="col-md-4 mb-2 mb-md-0">
                    <label class="form-label small fw-bold text-muted">Wildcard Mask</label>
                    <input type="text" class="ospf-wild form-control" placeholder="VD: 0.0.0.255">
                </div>
                <div class="col-md-4 mb-2 mb-md-0">
                    <label class="form-label small fw-bold text-muted">Area ID</label>
                    <input type="number" class="ospf-area form-control" value="0">
                </div>
            </div>
        </div>
    `;
    container.appendChild(row);
};

// 👉 THÊM HÀM MỚI NÀY (Để xử lý nút Thêm Area Type)
window.addOspfAreaTypeRow = function() {
    const container = document.getElementById('ospf-area-type-container');
    if (!container) return;
    const row = document.createElement('div');
    row.className = 'ospf-area-type-row card mb-3 border-0 shadow-sm';
    row.innerHTML = `
        <div class="card-body position-relative border-start border-3 border-info p-3 bg-white">
            <button type="button" class="btn btn-danger btn-sm position-absolute top-0 end-0 m-1 rounded-0 px-2" onclick="this.closest('.card').remove()" title="Xóa">X</button>
            <div class="row align-items-end pt-2 pe-3">
                <div class="col-md-6 mb-2 mb-md-0">
                    <label class="form-label small fw-bold text-muted">Area ID cần tùy chỉnh</label>
                    <input type="number" class="ospf-type-area form-control" value="1">
                </div>
                <div class="col-md-6 mb-2 mb-md-0">
                    <label class="form-label small fw-bold text-muted">Area Type</label>
                    <select class="ospf-type-sel form-select border-primary">
                        <option value="stub">Stub</option>
                        <option value="nssa">NSSA</option>
                    </select>
                </div>
            </div>
        </div>
    `;
    container.appendChild(row);
};

// Cập nhật lại hàm sendModule2 để lấy thêm data từ Area Type
window.sendModule2 = function() {
    // Lấy Networks
    const ospfNetworks = [];
    document.querySelectorAll('.ospf-net-row').forEach(row => {
        const ip = row.querySelector('.ospf-ip').value.trim();
        const wild = row.querySelector('.ospf-wild').value.trim();
        if (ip && wild) ospfNetworks.push({ "ip": ip, "wildcard": wild, "area": parseInt(row.querySelector('.ospf-area').value) || 0 });
    });

    // Lấy Area Types (MỚI)
    const ospfAreaTypes = [];
    document.querySelectorAll('.ospf-area-type-row').forEach(row => {
        const areaId = parseInt(row.querySelector('.ospf-type-area').value);
        const type = row.querySelector('.ospf-type-sel').value;
        if (!isNaN(areaId)) ospfAreaTypes.push({ "area": areaId, "type": type });
    });

    // Lấy Active Interfaces
    const ospfActiveInterfaces = [];
    document.querySelectorAll('.ospf-active-row').forEach(row => {
        const intName = row.querySelector('.ospf-active-name').value.trim();
        if (intName) ospfActiveInterfaces.push(intName);
    });

    // Lấy Cấu hình Cổng
    const ospfInterfaces = [];
    document.querySelectorAll('.ospf-int-row').forEach(row => {
        const intName = row.querySelector('.ospf-int-name').value.trim();
        if (intName) {
            ospfInterfaces.push({
                "interface_name": intName,
                "network_type": row.querySelector('.ospf-net-type').value,
                "cost": row.querySelector('.ospf-cost').value ? parseInt(row.querySelector('.ospf-cost').value) : null,
                "authen_type": row.querySelector('.ospf-authen-type').value,
                "authen_key": row.querySelector('.ospf-authen-key').value.trim()
            });
        }
    });

    // Lấy Summaries
    const ospfSummaries = [];
    document.querySelectorAll('.ospf-sum-row').forEach(row => {
        const ip = row.querySelector('.ospf-sum-ip').value.trim();
        const mask = row.querySelector('.ospf-sum-mask').value.trim();
        if (ip && mask) ospfSummaries.push({ "area": parseInt(row.querySelector('.ospf-sum-area').value) || 0, "ip": ip, "mask": mask });
    });

    // Lấy BGP Neighbors
    const bgpNeighbors = [];
    document.querySelectorAll('.bgp-neigh-row').forEach(row => {
        const ip = row.querySelector('.bgp-ip').value.trim();
        const remoteAs = parseInt(row.querySelector('.bgp-as').value);
        if (ip && !isNaN(remoteAs)) bgpNeighbors.push({ "ip": ip, "remote_as": remoteAs });
    });

    const targetIp = document.getElementById('target_router_ip').value.trim();
    if (!targetIp) {
        alert("⚠️ Vui lòng nhập 'Địa chỉ IP Router' ở trên cùng trước khi chạy cấu hình!");
        return;
    }

    // Đóng gói JSON
    const data = {
        target_ip: targetIp,
        ospf: {
            process_id: parseInt(document.getElementById('m2_ospf_pid').value) || 1,
            router_id: document.getElementById('m2_ospf_rid').value.trim(),
            redistribute: document.getElementById('m2_ospf_redist').value,
            networks: ospfNetworks,
            area_types: ospfAreaTypes,               // <--- Gửi kèm lên Backend
            active_interfaces: ospfActiveInterfaces,
            interfaces: ospfInterfaces,
            summaries: ospfSummaries
        },
        bgp: {
            local_as: parseInt(document.getElementById('m2_bgp_as').value) || 65000,
            router_id: document.getElementById('m2_bgp_rid').value.trim(),
            redistribute: document.getElementById('m2_bgp_redist').value,
            summary_ip: document.getElementById('m2_bgp_sum_ip').value.trim(),
            summary_mask: document.getElementById('m2_bgp_sum_mask').value.trim(),
            neighbors: bgpNeighbors
        }
    };
    
    console.log("📦 Dữ liệu Module 2 (MỚI):", data);
    callAPI('/api/config/module2-routing', data, 'btn-mod2');
};

// 3. Form BGP Neighbor (Dàn ngang, viền xanh dương đậm)
window.addBgpNeighborRow = function() {
    const container = document.getElementById('bgp-neighbor-container');
    if (!container) return;
    const row = document.createElement('div');
    row.className = 'bgp-neigh-row card mb-3 border-0 shadow-sm';
    row.innerHTML = `
        <div class="card-body position-relative border-start border-3 border-primary p-3 bg-white">
            <button type="button" class="btn btn-danger btn-sm position-absolute top-0 end-0 m-1 rounded-0 px-2" onclick="this.closest('.card').remove()" title="Xóa">X</button>
            
            <div class="row align-items-end pt-2 pe-3">
                <div class="col-md-6 mb-2 mb-md-0">
                    <label class="form-label small fw-bold text-muted">Neighbor IP</label>
                    <input type="text" class="bgp-ip form-control" placeholder="VD: 2.2.2.2">
                </div>
                <div class="col-md-6 mb-2 mb-md-0">
                    <label class="form-label small fw-bold text-muted">Remote AS</label>
                    <input type="number" class="bgp-as form-control" placeholder="VD: 65001">
                </div>
            </div>
        </div>
    `;
    container.appendChild(row);
};

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
                    <select class="form-select int-type">
                        <option value="GigabitEthernet">GigabitEthernet</option>
                        <option value="FastEthernet">FastEthernet</option>
                        <option value="Loopback">Loopback</option>
                        <option value="Vlan">Vlan</option>
                        <option value="Serial">Serial</option>
                    </select>
                </div>
                <div class="col-md-2 mb-2 mb-md-0">
                    <label class="form-label small fw-bold text-muted">Số Cổng</label>
                    <input type="text" class="form-control int-number" placeholder="VD: 0/0">
                </div>
                <div class="col-md-3 mb-2 mb-md-0">
                    <label class="form-label small fw-bold text-muted">IP Address</label>
                    <input type="text" class="form-control int-ip" placeholder="VD: 192.168.1.1">
                </div>
                <div class="col-md-4 mb-2 mb-md-0">
                    <label class="form-label small fw-bold text-muted">Subnet Mask</label>
                    <input type="text" class="form-control int-mask" placeholder="VD: 255.255.255.0">
                </div>
            </div>
        </div>
    `;
    container.appendChild(row);
};window.addInterfaceRow = function() {
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
                    <select class="form-select int-type">
                        <option value="GigabitEthernet">GigabitEthernet</option>
                        <option value="FastEthernet">FastEthernet</option>
                        <option value="Loopback">Loopback</option>
                        <option value="Vlan">Vlan</option>
                        <option value="Serial">Serial</option>
                    </select>
                </div>
                <div class="col-md-2 mb-2 mb-md-0">
                    <label class="form-label small fw-bold text-muted">Số Cổng</label>
                    <input type="text" class="form-control int-number" placeholder="VD: 0/0">
                </div>
                <div class="col-md-3 mb-2 mb-md-0">
                    <label class="form-label small fw-bold text-muted">IP Address</label>
                    <input type="text" class="form-control int-ip" placeholder="VD: 192.168.1.1">
                </div>
                <div class="col-md-4 mb-2 mb-md-0">
                    <label class="form-label small fw-bold text-muted">Subnet Mask</label>
                    <input type="text" class="form-control int-mask" placeholder="VD: 255.255.255.0">
                </div>
            </div>
        </div>
    `;
    container.appendChild(row);
};

// ==========================================
// HÀM UI CHO MODULE 5 (SERVICES & MGMT)
// ==========================================

window.addAaaRow = function() {
    const container = document.getElementById('aaa-container');
    const row = document.createElement('div');
    row.className = 'aaa-row card mb-2 border-0 shadow-sm';
    row.innerHTML = `
        <div class="card-body position-relative border-start border-3 border-purple p-3 bg-white" style="border-color: #9c27b0 !important;">
            <button type="button" class="btn btn-danger btn-sm position-absolute top-0 end-0 m-1 rounded-0 px-2" onclick="this.closest('.card').remove()">X</button>
            <div class="row align-items-end pt-2 pe-3">
                <div class="col-md-3 mb-2 mb-md-0">
                    <label class="form-label small fw-bold text-muted">Loại Server</label>
                    <select class="form-select aaa-type">
                        <option value="radius">RADIUS</option>
                        <option value="tacacs+">TACACS+</option>
                    </select>
                </div>
                <div class="col-md-4 mb-2 mb-md-0">
                    <label class="form-label small fw-bold text-muted">IP Server</label>
                    <input type="text" class="form-control aaa-ip" placeholder="VD: 10.0.0.100">
                </div>
                <div class="col-md-5">
                    <label class="form-label small fw-bold text-muted">Secret Key (Mật khẩu chia sẻ)</label>
                    <input type="text" class="form-control aaa-key" placeholder="VD: cisco123">
                </div>
            </div>
        </div>
    `;
    container.appendChild(row);
};

window.addSyslogRow = function() {
    const container = document.getElementById('syslog-container');
    const row = document.createElement('div');
    row.className = 'syslog-row card mb-2 border-0 shadow-sm';
    row.innerHTML = `
        <div class="card-body position-relative border-start border-3 border-primary p-3 bg-white">
            <button type="button" class="btn btn-danger btn-sm position-absolute top-0 end-0 m-1 rounded-0 px-2" onclick="this.closest('.card').remove()">X</button>
            <div class="row align-items-end pt-2 pe-3">
                <div class="col-md-6 mb-2 mb-md-0">
                    <label class="form-label small fw-bold text-muted">Syslog Server IP</label>
                    <input type="text" class="form-control syslog-ip" placeholder="VD: 192.168.1.50">
                </div>
                <div class="col-md-6">
                    <label class="form-label small fw-bold text-muted">Trap Level (0-7)</label>
                    <select class="form-select syslog-level">
                        <option value="7">7 - Debugging (Tất cả)</option>
                        <option value="6">6 - Informational</option>
                        <option value="4" selected>4 - Warnings</option>
                        <option value="0">0 - Emergencies (Chỉ lỗi nặng)</option>
                    </select>
                </div>
            </div>
        </div>
    `;
    container.appendChild(row);
};

window.addFtpRow = function() {
    const container = document.getElementById('ftp-container');
    const row = document.createElement('div');
    row.className = 'ftp-row card mb-2 border-0 shadow-sm';
    row.innerHTML = `
        <div class="card-body position-relative border-start border-3 border-info p-3 bg-white">
            <button type="button" class="btn btn-danger btn-sm position-absolute top-0 end-0 m-1 rounded-0 px-2" onclick="this.closest('.card').remove()">X</button>
            <div class="row align-items-end pt-2 pe-3">
                <div class="col-md-3 mb-2 mb-md-0">
                    <label class="form-label small fw-bold text-muted">Giao thức</label>
                    <select class="form-select ftp-type">
                        <option value="tftp">TFTP (Không cần Pass)</option>
                        <option value="ftp">FTP</option>
                    </select>
                </div>
                <div class="col-md-3 mb-2 mb-md-0">
                    <label class="form-label small fw-bold text-muted">Server IP</label>
                    <input type="text" class="form-control ftp-ip" placeholder="VD: 172.16.0.5">
                </div>
                <div class="col-md-3 mb-2 mb-md-0">
                    <label class="form-label small fw-bold text-muted">Username (Nếu FTP)</label>
                    <input type="text" class="form-control ftp-user" placeholder="VD: admin">
                </div>
                <div class="col-md-3">
                    <label class="form-label small fw-bold text-muted">Password (Nếu FTP)</label>
                    <input type="text" class="form-control ftp-pass" placeholder="***">
                </div>
            </div>
        </div>
    `;
    container.appendChild(row);
};

window.addDhcpRow = function() {
    const container = document.getElementById('dhcp-container');
    const row = document.createElement('div');
    row.className = 'dhcp-row card mb-3 border-0 shadow-sm';
    row.innerHTML = `
        <div class="card-body position-relative border-start border-3 border-success p-3 bg-white">
            <button type="button" class="btn btn-danger btn-sm position-absolute top-0 end-0 m-1 rounded-0 px-2" onclick="this.closest('.card').remove()">X</button>
            
            <div class="row mb-3 pe-3">
                <div class="col-md-4 mb-2 mb-md-0">
                    <label class="form-label small fw-bold text-muted">Tên Pool DHCP</label>
                    <input type="text" class="form-control dhcp-name" placeholder="VD: LAN_POOL">
                </div>
                <div class="col-md-4 mb-2 mb-md-0">
                    <label class="form-label small fw-bold text-muted">Network IP</label>
                    <input type="text" class="form-control dhcp-net" placeholder="VD: 192.168.10.0">
                </div>
                <div class="col-md-4 mb-2 mb-md-0">
                    <label class="form-label small fw-bold text-muted">Subnet Mask</label>
                    <input type="text" class="form-control dhcp-mask" placeholder="VD: 255.255.255.0">
                </div>
            </div>
            <div class="row pe-3">
                <div class="col-md-4 mb-2 mb-md-0">
                    <label class="form-label small fw-bold text-muted">Default Router (Gateway)</label>
                    <input type="text" class="form-control dhcp-gw" placeholder="VD: 192.168.10.1">
                </div>
                <div class="col-md-4 mb-2 mb-md-0">
                    <label class="form-label small fw-bold text-muted">DNS Server</label>
                    <input type="text" class="form-control dhcp-dns" placeholder="VD: 8.8.8.8">
                </div>
                <div class="col-md-4 mb-2 mb-md-0">
                    <label class="form-label small fw-bold text-danger">IP Loại trừ (Excluded)</label>
                    <input type="text" class="form-control dhcp-exclude" placeholder="VD: 192.168.10.1 192.168.10.10">
                </div>
            </div>
        </div>
    `;
    container.appendChild(row);
};

window.addIpSlaRow = function() {
    const container = document.getElementById('ipsla-container');
    const row = document.createElement('div');
    row.className = 'ipsla-row card mb-2 border-0 shadow-sm';
    row.innerHTML = `
        <div class="card-body position-relative border-start border-3 border-warning p-3 bg-white">
            <button type="button" class="btn btn-danger btn-sm position-absolute top-0 end-0 m-1 rounded-0 px-2" onclick="this.closest('.card').remove()">X</button>
            <div class="row align-items-end pt-2 pe-3">
                <div class="col-md-2 mb-2 mb-md-0">
                    <label class="form-label small fw-bold text-muted">SLA ID</label>
                    <input type="number" class="form-control sla-id" value="1">
                </div>
                <div class="col-md-4 mb-2 mb-md-0">
                    <label class="form-label small fw-bold text-muted">IP Đích (Ping tới đâu?)</label>
                    <input type="text" class="form-control sla-dest" placeholder="VD: 8.8.8.8">
                </div>
                <div class="col-md-3 mb-2 mb-md-0">
                    <label class="form-label small fw-bold text-muted">Tần suất (Seconds)</label>
                    <input type="number" class="form-control sla-freq" value="5">
                </div>
                <div class="col-md-3 mb-2 mb-md-0">
                    <label class="form-label small fw-bold text-muted">Lịch biểu (Schedule)</label>
                    <select class="form-select sla-sched">
                        <option value="life forever">Life Forever (Chạy luôn)</option>
                    </select>
                </div>
            </div>
        </div>
    `;
    container.appendChild(row);
};

// Hàm Thu thập dữ liệu Module 5
window.sendModule5 = function() {
    const aaa = [];
    document.querySelectorAll('.aaa-row').forEach(row => {
        aaa.push({ type: row.querySelector('.aaa-type').value, ip: row.querySelector('.aaa-ip').value, key: row.querySelector('.aaa-key').value });
    });

    const syslog = [];
    document.querySelectorAll('.syslog-row').forEach(row => {
        syslog.push({ ip: row.querySelector('.syslog-ip').value, level: row.querySelector('.syslog-level').value });
    });

    const fileTransfer = [];
    document.querySelectorAll('.ftp-row').forEach(row => {
        fileTransfer.push({ type: row.querySelector('.ftp-type').value, ip: row.querySelector('.ftp-ip').value, user: row.querySelector('.ftp-user').value, pass: row.querySelector('.ftp-pass').value });
    });

    const dhcp = [];
    document.querySelectorAll('.dhcp-row').forEach(row => {
        dhcp.push({ 
            name: row.querySelector('.dhcp-name').value, net: row.querySelector('.dhcp-net').value, mask: row.querySelector('.dhcp-mask').value,
            gw: row.querySelector('.dhcp-gw').value, dns: row.querySelector('.dhcp-dns').value, exclude: row.querySelector('.dhcp-exclude').value 
        });
    });

    const ipsla = [];
    document.querySelectorAll('.ipsla-row').forEach(row => {
        ipsla.push({ id: row.querySelector('.sla-id').value, dest: row.querySelector('.sla-dest').value, freq: row.querySelector('.sla-freq').value, sched: row.querySelector('.sla-sched').value });
    });

    const targetIp = document.getElementById('target_router_ip').value.trim();
    if (!targetIp) { alert("⚠️ Vui lòng nhập 'Địa chỉ IP Router'!"); return; }

    const data = { target_ip: targetIp, aaa: aaa, syslog: syslog, file_transfer: fileTransfer, dhcp: dhcp, ipsla: ipsla };
    console.log("📦 Dữ liệu Module 5:", data);
    callAPI('/api/config/module5-services', data, 'btn-mod5');
};
window.addSubInterfaceRow = function() {
    const container = document.getElementById('subint-container');
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

window.addHsrpRow = function() {
    const container = document.getElementById('hsrp-container');
    const row = document.createElement('div');
    row.className = 'hsrp-row card mb-2 border-0 shadow-sm';
    row.innerHTML = `
        <div class="card-body position-relative border-start border-3 border-warning p-3 bg-white">
            <button type="button" class="btn btn-danger btn-sm position-absolute top-0 end-0 m-1 rounded-0 px-2" onclick="this.closest('.card').remove()">X</button>
            <div class="row align-items-end pt-2 pe-3">
                <div class="col-md-3 mb-2"><label class="form-label small fw-bold text-muted">Cổng áp dụng</label><input type="text" class="form-control hsrp-int" placeholder="VD: G0/1"></div>
                <div class="col-md-2 mb-2"><label class="form-label small fw-bold text-muted">Group ID</label><input type="number" class="form-control hsrp-grp" value="1"></div>
                <div class="col-md-3 mb-2"><label class="form-label small fw-bold text-muted">Virtual IP (Gateway)</label><input type="text" class="form-control hsrp-vip" placeholder="VD: 192.168.1.254"></div>
                <div class="col-md-2 mb-2"><label class="form-label small fw-bold text-muted">Priority</label><input type="number" class="form-control hsrp-pri" placeholder="VD: 110"></div>
                <div class="col-md-2 mb-2"><label class="form-label small fw-bold text-muted">Preempt</label>
                    <select class="form-select hsrp-preempt"><option value="yes">Bật</option><option value="no">Tắt</option></select>
                </div>
            </div>
        </div>
    `;
    container.appendChild(row);
};

window.addNtpRow = function() {
    const container = document.getElementById('ntp-container');
    const row = document.createElement('div');
    row.className = 'ntp-row card mb-2 border-0 shadow-sm';
    row.innerHTML = `
        <div class="card-body position-relative border-start border-3 border-primary p-3 bg-white">
            <button type="button" class="btn btn-danger btn-sm position-absolute top-0 end-0 m-1 rounded-0 px-2" onclick="this.closest('.card').remove()">X</button>
            <div class="row align-items-end pt-2 pe-3">
                <div class="col-md-8 mb-2"><label class="form-label small fw-bold text-muted">NTP Server IP</label><input type="text" class="form-control ntp-ip" placeholder="VD: 8.8.8.8"></div>
                <div class="col-md-4 mb-2"><label class="form-label small fw-bold text-muted">Ưu tiên (Prefer)</label>
                    <select class="form-select ntp-prefer"><option value="no">Không</option><option value="yes">Có</option></select>
                </div>
            </div>
        </div>
    `;
    container.appendChild(row);
};

// ==========================================
// HÀM UI CHO MODULE 3 (VPN & DMVPN)
// ==========================================

// Hàm thêm giao diện Tunnel Động
window.addVpnTunnelRow = function() {
    const container = document.getElementById('vpn-tunnel-container');
    if (!container) return;

    // Tạo một ID ngẫu nhiên (dùng để điều khiển việc ẩn/hiện các ô form riêng biệt cho từng khối Card)
    const uniqueId = Date.now() + Math.floor(Math.random() * 1000);

    const row = document.createElement('div');
    row.className = 'vpn-tunnel-row card mb-3 border-0 shadow-sm';
    row.innerHTML = `
        <div class="card-body position-relative border-start border-3 border-success p-3 bg-white">
            <button type="button" class="btn btn-danger btn-sm position-absolute top-0 end-0 m-1 rounded-0 px-2 shadow-sm" onclick="this.closest('.card').remove()" title="Xóa">X</button>

            <!-- HÀNG 1: Chọn Chế Độ, ID và IP -->
            <div class="row align-items-end mb-3 pe-4">
                <div class="col-md-4 mb-2 mb-md-0">
                    <label class="form-label small fw-bold text-success">Chọn chế độ VPN</label>
                    <select class="form-select border-success tunnel-mode-select" onchange="toggleTunnelForm('${uniqueId}', this.value)">
                        <option value="gre">GRE (Site-to-Site)</option>
                        <option value="dmvpn-hub">DMVPN (Hub)</option>
                        <option value="dmvpn-spoke">DMVPN (Spoke)</option>
                    </select>
                </div>
                <div class="col-md-2 mb-2 mb-md-0">
                    <label class="form-label small fw-bold text-muted">Tunnel ID</label>
                    <input type="number" class="form-control tunnel-id" value="0">
                </div>
                <div class="col-md-6">
                    <label class="form-label small fw-bold text-muted">IP Tunnel & Subnet Mask</label>
                    <div class="input-group">
                        <input type="text" class="form-control tunnel-ip" placeholder="VD: 172.16.1.1">
                        <input type="text" class="form-control tunnel-mask" placeholder="VD: 255.255.255.0">
                    </div>
                </div>
            </div>

            <!-- HÀNG 2: Source và Destination (Dùng chung) -->
            <div class="row align-items-end pe-4">
                <div class="col-md-6 mb-2">
                    <label class="form-label small fw-bold text-muted">Tunnel Source (Cổng / IP Nội bộ)</label>
                    <input type="text" class="form-control tunnel-source" placeholder="VD: GigabitEthernet0/1">
                </div>
                
                <!-- DESTINATION (Chỉ hiện khi chọn GRE) -->
                <div class="col-md-6 mb-2" id="gre_dest_${uniqueId}">
                    <label class="form-label small fw-bold text-muted">Tunnel Destination (IP WAN Đích)</label>
                    <input type="text" class="form-control tunnel-dest" placeholder="VD: 8.8.8.8">
                </div>
            </div>

            <!-- HÀNG 3: Khối DMVPN (Bị ẩn mặc định, chỉ xồ ra khi chọn DMVPN) -->
            <div class="row pt-3 mt-1 border-top d-none pe-4" id="dmvpn_fields_${uniqueId}">
                <div class="col-md-3 mb-2">
                    <label class="form-label small fw-bold text-primary">NHRP Network ID</label>
                    <input type="number" class="form-control nhrp-id" placeholder="VD: 100">
                </div>
                <div class="col-md-3 mb-2">
                    <label class="form-label small fw-bold text-primary">NHRP Password</label>
                    <input type="text" class="form-control nhrp-key" placeholder="VD: cisco123">
                </div>
                
                <!-- 2 Ô này chỉ xồ ra khi chọn Spoke -->
                <div class="col-md-3 mb-2 d-none" id="dmvpn_spoke_nhs_${uniqueId}">
                    <label class="form-label small fw-bold text-danger">IP của Hub (NHS)</label>
                    <input type="text" class="form-control nhs-ip" placeholder="VD: 172.16.1.254">
                </div>
                 <div class="col-md-3 mb-2 d-none" id="dmvpn_spoke_nbma_${uniqueId}">
                    <label class="form-label small fw-bold text-danger">IP WAN của Hub</label>
                    <input type="text" class="form-control nhs-nbma" placeholder="VD: 8.8.8.8">
                </div>
            </div>
        </div>
    `;
    container.appendChild(row);
};

// Hàm điều khiển việc "xồ ra" cấu hình tùy theo chế độ được chọn
window.toggleTunnelForm = function(id, mode) {
    const greDest = document.getElementById(`gre_dest_${id}`);
    const dmvpnFields = document.getElementById(`dmvpn_fields_${id}`);
    const spokeNhs = document.getElementById(`dmvpn_spoke_nhs_${id}`);
    const spokeNbma = document.getElementById(`dmvpn_spoke_nbma_${id}`);

    if (mode === 'gre') {
        // GRE: Mở Dest, Đóng DMVPN
        greDest.classList.remove('d-none');
        dmvpnFields.classList.add('d-none');
    } else if (mode === 'dmvpn-hub') {
        // DMVPN HUB: Đóng Dest, Mở DMVPN (Nhưng Đóng Spoke)
        greDest.classList.add('d-none');
        dmvpnFields.classList.remove('d-none');
        spokeNhs.classList.add('d-none');
        spokeNbma.classList.add('d-none');
    } else if (mode === 'dmvpn-spoke') {
        // DMVPN SPOKE: Đóng Dest, Mở toàn bộ DMVPN (Kể cả Spoke)
        greDest.classList.add('d-none');
        dmvpnFields.classList.remove('d-none');
        spokeNhs.classList.remove('d-none');
        spokeNbma.classList.remove('d-none');
    }
};
