from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Optional, Literal
import subprocess
import json

app = FastAPI(title="Mini DNA Center API - Expert Version")
app.mount("/static", StaticFiles(directory="static"), name="static")
@app.get("/")
def serve_webpage():
    return FileResponse("index.html")
# ==========================================
# MODULE 0: CẤU HÌNH CƠ BẢN (DAY-0 CONFIG)
# ==========================================
from pydantic import BaseModel
from typing import List, Optional

class BasicInterface(BaseModel):
    name: str
    ip: str
    mask: str

class BasicConfig(BaseModel):
    hostname: Optional[str] = None
    domain_lookup: bool = False
    admin_user: Optional[str] = None
    admin_pass: Optional[str] = None
    interfaces: List[BasicInterface] = []

class SubInterfaceItem(BaseModel):
    name: str
    vlan_id: int  # Giữ đúng tên vlan_id như trong ảnh của bạn
    ip: str
    mask: str

class Module0Config(BaseModel):
    target_ip: str
    subInterfaces: List[SubInterfaceItem] = []
    basic: Optional[BasicConfig] = None

@app.post("/api/config/basic")
def config_basic(data: Module0Config):
    import json, subprocess
    extra_vars = json.dumps(data.dict())
    
    command = ["ansible-playbook", "playbook.yml", "-e", extra_vars]
    
    try:
        result = subprocess.run(command, capture_output=True, text=True, check=True)
        return {"status": "success", "ansible_log": result.stdout}
    except subprocess.CalledProcessError as e:
        return {"status": "error", "ansible_log": e.stdout}

# ==========================================
# MODULE 1: ROUTING (OSPF & BGP Nâng cao)
# ==========================================
from typing import List, Optional
from pydantic import BaseModel

class StaticRouteItem(BaseModel):
    net: str
    mask: str
    next_hop: str
    ad: Optional[int] = None

class RedistributeConfig(BaseModel):
    protocol: str
    metric: Optional[int] = None

class SummaryConfig(BaseModel):
    network: str
    mask: str

class OspfArea(BaseModel):
    area_id: str                        # VD: "1", "2", hoặc "0.0.0.1"
    area_type: str                      # VD: "stub", "stub no-summary", "nssa"

class OspfInterface(BaseModel):
    name: str                           # VD: "GigabitEthernet0/0"
    network_type: Optional[str] = None  # CŨ: VD: "point-to-point", "broadcast"
    cost: Optional[int] = None          # MỚI
    mtu: Optional[int] = None
    auth_key: Optional[str] = None
    ello: Optional[int] = None         # BỔ SUNG: Thời gian Hello (Hello interval)
    dead: Optional[int] = None

class OSPFConfig(BaseModel):
    process_id: int = 1
    router_id: Optional[str] = None
    networks: List[str] = []
    passive_interfaces: Optional[List[str]] = None
    areas: Optional[List[OspfArea]] = None                  # CŨ: Cấu hình Area Type (Stub, NSSA)
    interfaces: Optional[List[OspfInterface]] = None
    redistributes: List[RedistributeConfig] = []# MỚI: Redistribute
    summaries: List[SummaryConfig] = []         # MỚI: Tóm tắt route (area range)

class OSPFv3Config(BaseModel):
    process_id: int = 1
    router_id: str
    interfaces_enabled: List[str] = []

class BgpNeighbor(BaseModel):
    ip: str
    remote_as: int
    route_reflector_client: bool = False
    weight: Optional[int] = None
    set_local_pref: Optional[int] = None
    set_med: Optional[int] = None
    set_as_path_prepend: Optional[str] = None

class BGPConfig(BaseModel):
    local_as: int
    router_id: Optional[str] = None
    networks: List[str] = []
    neighbors: List[BgpNeighbor] = []
    redistributes: List[RedistributeConfig] = []
    summaries: List[SummaryConfig] = []

class EIGRPInterface(BaseModel):   
    name: str
    hello_interval: Optional[int] = None
    hold_time: Optional[int] = None
    auth_keychain: Optional[str] = None
    summary_address: Optional[str] = None


class EIGRPConfig(BaseModel):
    asn: int
    router_id: Optional[str] = None
    networks: List[str]
    k_values: Optional[str] = None
    variance: Optional[int] = None
    passive_interfaces: Optional[List[str]] = None
    redistribute: Optional[str] = None
    interfaces: Optional[List[EIGRPInterface]] = []

class EigrpItem(BaseModel):
    asn: int
    network: str
    wildcard: str

class IsisItem(BaseModel):
    net_title: str       # Network Entity Title (VD: 49.0001.0000.0000.0001.00)
    interface: str

class Module2Config(BaseModel):
    target_ip: str
    ospf: Optional[OSPFConfig] = None
    ospfv3: Optional[OSPFv3Config] = None
    bgp: Optional[BGPConfig] = None
    eigrp: List[EigrpItem] = []
    isis: List[IsisItem] = []
    static_routes: List[StaticRouteItem] = []

# ==========================================
# MODULE 2: VPN & WAN (GRE, DMVPN PHASE 3 & IPSEC)
# ==========================================
class GREConfig(BaseModel):
    enabled: bool = False
    interface_name: int
    ip: str
    mask: str
    source: str
    destination: str

class Isa(BaseModel):
    policy_id: int
    encryption: str
    hash: str
    authentication: str
    group: int

class IPsecConfig(BaseModel):
    enabled: bool = True
    policy_id: list[Isa]
    pre_shared_key: str
    ip_key: str
    transform_set_name: str
    peer_address: str
    profile_name: str
    tranform_mode: Optional[str] = None

class DMVPNConfig(BaseModel):
    enabled: bool = False
    role: str = "spoke"                    # Chọn "hub" hoặc "spoke"
    interface_name: str
    ip: str
    mask: str
    source: str
    nhrp_id: int
    tunnel_key: int
    hub_tunnel_ip: Optional[str]
    hub_physical_ip: Optional[str]
    nhrp_authen: Optional[str] = None

class FhrpItem(BaseModel):
    protocol: Literal["hsrp", "vrrp", "glbp"]
    interface: str
    group: int
    vip: str
    priority: int
    preempt: str
    vrrp_adv: Optional[int] = None
    glbp_lb: Optional[str] = None


class Module3Config(BaseModel):
    target_ip: str
    gre: Optional[GREConfig] = None
    ipsec: Optional[IPsecConfig] = None    # Khai báo Schema IPsec mới
    dmvpn: Optional[DMVPNConfig] = None
    fhrp: List[FhrpItem] = []

@app.post("/api/config/module3-vpn")
def config_module3(data: Module3Config):
    extra_vars = json.dumps(data.dict())
    command = ["ansible-playbook", "module3_vpn.yml", "-e", extra_vars]
    
    try:
        result = subprocess.run(command, capture_output=True, text=True, check=True)
        return {"status": "success", "ansible_log": result.stdout}
    except subprocess.CalledProcessError as e:
        return {"status": "error", "ansible_log": e.stdout}

# ==========================================
# MODULE 3: SERVICES (NAT NÂNG CAO, QoS ISP, IP SLA)
# ==========================================

class PatAcl(BaseModel):
    acl_name: str
    acl_type: str       # Sẽ nhận giá trị 'standard' hoặc 'extended'
    acl_ip: str
    acl_mask: str

class DynamicNat(BaseModel):
    acl_name: str
    network: str
    wildcard: str

class StaticNat(BaseModel):
    inside_ip: str
    outside_ip: str
    port: Optional[int] = None

class NatConfig(BaseModel):
    mode: str
    inside_interfaces: List[str] = []
    outside_interfaces: List[str] = []
    dynamic: DynamicNat
    static: List[StaticNat] = []

class QoSConfig(BaseModel):
    enabled: bool = False
    class_name: str
    match_acl: Optional[str] = None          # Đã chuyển sang dùng ACL để phân loại
    policy_name: str
    
    # --- CÁC TÍNH NĂNG QOS NÂNG CAO (Tuỳ chọn) ---
    bandwidth_percent: Optional[int] = None       # Ví dụ: 30 (%)
    shape_rate: Optional[int] = None              # Ví dụ: 10000000 (bps)
    police_rate: Optional[int] = None             # Ví dụ: 5000000 (bps)
    queue_type: Optional[str] = "fair-queue"      # "fair-queue" hoặc rỗng
    
    interface_name: str = "GigabitEthernet0/0"
    direction: str                        # "in" hoặc "out"

class IPSLAConfig(BaseModel):
    enabled: bool = False
    id: int
    destination: str
    source: str
    frequency: int
    track_id: int

class Module4Config(BaseModel):
    target_ip: str
    nat: Optional[NatConfig] = None
    qos: Optional[QoSConfig] = None
    ipsla: Optional[IPSLAConfig] = None

@app.post("/api/config/module4-services")
def config_module4(data: Module4Config):
    import json, subprocess
    extra_vars = json.dumps(data.dict())
    command = ["ansible-playbook", "module4_services.yml", "-e", extra_vars]
    
    try:
        result = subprocess.run(command, capture_output=True, text=True, check=True)
        return {"status": "success", "ansible_log": result.stdout}
    except subprocess.CalledProcessError as e:
        return {"status": "error", "ansible_log": e.stdout}

# Module 4ư

class AaaItem(BaseModel):
    type: str
    ip: str
    key: str

class SyslogItem(BaseModel):
    ip: str
    level: int
    source_int: Optional[str] = None

class FtpItem(BaseModel):
    type: str
    ip: str
    user: Optional[str] = None
    pass_key: Optional[str] = None

class DhcpItem(BaseModel):
    name: str
    net: str
    mask: str
    gw: Optional[str] = None
    dns: Optional[str] = None
    exclude: Optional[str] = None

class DhcpRelayItem(BaseModel):
    interface: str
    helper_ip: str

class IpSlaItem(BaseModel):
    id: int
    dest: str
    freq: int
    sched: str
    protocol: str
    source_interface: Optional[str] = None

class NtpItem(BaseModel):
    role: Literal["client", "master", "peer", "broadcast", "multicast"]
    ip_address: Optional[str] = None
    stratum: Optional[int] = None
    interface: Optional[str] = None
    direction: Optional[Literal["send", "receive"]] = None

class Module5Config(BaseModel):
    target_ip: str
    aaa: List[AaaItem] = []
    syslog: List[SyslogItem] = []
    file_transfer: List[FtpItem] = []
    dhcp: List[DhcpItem] = []
    dhcp_relays: List[DhcpRelayItem] = []
    ipsla: List[IpSlaItem] = []
    ntp: List[NtpItem] = []

@app.post("/api/config/module5-services")
def config_module5(data: Module5Config):
    extra_vars = json.dumps(data.dict())
    
    # Bạn sẽ cần tạo một file tên là module5_services.yml bên thư mục chứa Playbook
    command = ["ansible-playbook", "module5_services.yml", "-e", extra_vars]
    
    try:
        result = subprocess.run(command, capture_output=True, text=True, check=True)
        return {"status": "success", "ansible_log": result.stdout}
    except subprocess.CalledProcessError as e:
        return {"status": "error", "ansible_log": e.stdout}
