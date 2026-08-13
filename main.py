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
    hostname: str
    domain_lookup: bool = False
    domain_name: str
    admin_user: str
    admin_pass: str
    transport: str = "ssh telnet"
    ssh_version: int = 2
    ssh_key_size: int = 2048
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
# MODULE 2: ROUTING (OSPF & BGP Nâng cao)
# ==========================================
from typing import List, Optional
from pydantic import BaseModel

class RedistributeConfig(BaseModel):
    protocol: str                       # VD: "static", "connected", "bgp 65000"
    metric: Optional[int] = None

class SummaryConfig(BaseModel):
    network: str                        # VD: "10.0.0.0"
    mask: str                           # VD: "255.0.0.0"

class OspfArea(BaseModel):
    area_id: str                        # VD: "1", "2", hoặc "0.0.0.1"
    area_type: str                      # VD: "stub", "stub no-summary", "nssa"

class OspfInterface(BaseModel):
    name: str                           # VD: "GigabitEthernet0/0"
    network_type: Optional[str] = None  # CŨ: VD: "point-to-point", "broadcast"
    cost: Optional[int] = None          # MỚI
    mtu: Optional[int] = None           # MỚI
    auth_key: Optional[str] = None      # MỚI

class OSPFConfig(BaseModel):
    process_id: int = 1
    router_id: Optional[str] = None
    networks: List[str] = []
    passive_interfaces: Optional[List[str]] = None
    areas: List[OspfArea] = []                  # CŨ: Cấu hình Area Type (Stub, NSSA)
    interfaces: List[OspfInterface] = []        # GỘP: Cấu hình cổng (Network type, Cost, MTU)
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
    summaries: List[SummaryConfig] = []         # (aggregate-address trong BGP)

class Module2Config(BaseModel):
    target_ip: str
    ospf: Optional[OSPFConfig] = None
    ospfv3: Optional[OSPFv3Config] = None
    bgp: Optional[BGPConfig] = None


# ==========================================
# MODULE 3: VPN & WAN (GRE, DMVPN PHASE 3 & IPSEC)
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

class HsrpItem(BaseModel):
    interface: str
    group: int
    vip: str
    priority: int
    preempt: str


class Module3Config(BaseModel):
    target_ip: str
    gre: Optional[GREConfig] = None
    ipsec: Optional[IPsecConfig] = None    # Khai báo Schema IPsec mới
    dmvpn: Optional[DMVPNConfig] = None
    hsrp: List[HsrpItem] = []

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
# MODULE 4: SERVICES (NAT NÂNG CAO, QoS ISP, IP SLA)
# ==========================================
class NATInterface(BaseModel):
    name: str
    type: str                 # "inside" hoặc "outside"

class PatAcl(BaseModel):
    acl_name: str
    acl_type: str       # Sẽ nhận giá trị 'standard' hoặc 'extended'
    acl_ip: str
    acl_mask: str

class NATStaticRule(BaseModel):
    local_ip: str             # IP Server nội bộ
    global_ip: str
    port: Optional[str] = None

class NATConfig(BaseModel):
    enabled: bool = False
    interfaces: Optional [List[NATInterface]] = None
    pat_acl: Optional[PatAcl] = None
    static_rules: Optional[List[NATStaticRule]] = []

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
    nat: Optional[NATConfig] = None
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


class AaaItem(BaseModel):
    type: str
    ip: str
    key: str

class SyslogItem(BaseModel):
    ip: str
    level: int

class FtpItem(BaseModel):
    type: str
    ip: str
    user: str = ""
    pass_key: str = "" # Dùng pass_key vì pass là từ khóa của Python

class DhcpItem(BaseModel):
    name: str
    net: str
    mask: str
    gw: str
    dns: str
    exclude: str

class IpSlaItem(BaseModel):
    id: int
    dest: str
    freq: int
    sched: str

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
