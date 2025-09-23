// Cấu trúc dữ liệu cho vai trò MBTI (Đã cập nhật Tiếng Việt)
const mbtiData = {
  "ENTJ": { description: "Quyết đoán, có tầm nhìn chiến lược và là nhà lãnh đạo bẩm sinh.", suggestedRole: "Lãnh đạo / Điều phối", coreRole: "Leader" },
  "ESTJ": { description: "Thực tế, có tổ chức, giỏi quản lý và thực thi kế hoạch.", suggestedRole: "Lãnh đạo / Điều phối", coreRole: "Leader" },
  "INTJ": { description: "Chiến lược, có tầm nhìn xa, độc lập và yêu cầu cao về logic.", suggestedRole: "Hoạch định / Kiến trúc", coreRole: "Planner" },
  "ISTJ": { description: "Có trách nhiệm, đáng tin cậy, tỉ mỉ và tuân thủ quy tắc.", suggestedRole: "Hoạch định / Kiến trúc", coreRole: "Planner" },
  "ENTP": { description: "Táo bạo, sáng tạo, thông minh và thích tranh luận ý tưởng.", suggestedRole: "Sáng tạo / Chiến lược", coreRole: "Innovator" },
  "INTP": { description: "Độc lập, phân tích, có tư duy trừu tượng và logic sâu sắc.", suggestedRole: "Sáng tạo / Chiến lược", coreRole: "Innovator" },
  "ENFJ": { description: "Truyền cảm hứng, lôi cuốn, có khả năng kết nối và dẫn dắt người khác.", suggestedRole: "Hỗ trợ / Truyền cảm hứng", coreRole: "Supporter" },
  "INFJ": { description: "Sâu sắc, có tầm nhìn, luôn tìm kiếm ý nghĩa và giúp đỡ người khác.", suggestedRole: "Hỗ trợ / Truyền cảm hứng", coreRole: "Supporter" },
  "ESFJ": { description: "Thân thiện, có trách nhiệm, quan tâm và giỏi tạo dựng sự hòa hợp.", suggestedRole: "Kết nối / Vận hành", coreRole: "Facilitator" },
  "ISFJ": { description: "Tận tâm, chu đáo, có trách nhiệm và luôn sẵn sàng hỗ trợ.", suggestedRole: "Kết nối / Vận hành", coreRole: "Facilitator" },
  "ESFP": { description: "Nhiệt tình, hòa đồng, ứng biến nhanh và mang lại năng lượng cho mọi người.", suggestedRole: "Hỗ trợ / Truyền cảm hứng", coreRole: "Supporter" },
  "ISFP": { description: "Nhạy cảm, nghệ sĩ, thích ứng và sống cho hiện tại.", suggestedRole: "Hỗ trợ / Truyền cảm hứng", coreRole: "Supporter" },
  "ESTP": { description: "Năng động, thực tế, giỏi giải quyết vấn đề và hành động nhanh.", suggestedRole: "Thực thi / Giải quyết vấn đề", coreRole: "Executor" },
  "ISTP": { description: "Thực tế, logic, giỏi về kỹ thuật và giữ được sự bình tĩnh khi khủng hoảng.", suggestedRole: "Thực thi / Giải quyết vấn đề", coreRole: "Executor" },
  "ENFP": { description: "Nhiệt huyết, sáng tạo, giàu trí tưởng tượng và giỏi kết nối con người.", suggestedRole: "Sáng tạo / Chiến lược", coreRole: "Innovator" },
  "INFP": { description: "Lý tưởng, giàu trí tưởng tượng, trung thành với giá trị cá nhân.", suggestedRole: "Sáng tạo / Chiến lược", coreRole: "Innovator" }
};

let membersData = [];
const API_URL = "http://127.0.0.1:5000";

// --- Chức năng chuyển tab ---
function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
    document.querySelectorAll('.tab-button').forEach(button => button.classList.remove('active'));
    document.getElementById(tabId).classList.remove('hidden');
    document.querySelector(`[onclick="showTab('${tabId}')"]`).classList.add('active');
}

// --- Chức năng Dự đoán Cá nhân ---
async function predictMBTI() {
    const userInput = document.getElementById("userInput").value;
    if (!userInput.trim()) {
        alert("Vui lòng nhập văn bản để dự đoán.");
        return;
    }

    const resultContainer = document.getElementById("result");
    const loadingContainer = document.getElementById("loadingSingle");
    resultContainer.classList.add("hidden");
    loadingContainer.classList.remove("hidden");

    try {
        const response = await fetch(`${API_URL}/predict`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: userInput })
        });
        const data = await response.json();
        if (data.error) throw new Error(data.error);
        
        const roleInfo = mbtiData[data.mbti_type] || { suggestedRole: "N/A" };

        document.getElementById("mbtiType").textContent = data.mbti_type;
        document.getElementById("suggestedRole").textContent = roleInfo.suggestedRole;
        document.getElementById("binaryVector").textContent = `[${data.binary.join(", ")}]`;
        
        const tokensContainer = document.getElementById("influentialTokens");
        if(tokensContainer && data.influential_tokens){
            tokensContainer.innerHTML = data.influential_tokens.map(token => `<span class="influential-token">${token}</span>`).join(' ');
        }

        resultContainer.classList.remove("hidden");
    } catch (error) {
        alert(`Lỗi: ${error.message}`);
    } finally {
        loadingContainer.classList.add("hidden");
    }
}

// --- Chức năng Xây dựng Đội nhóm ---
function setupTeamInputs() {
    const teamSize = document.getElementById("teamSize").value;
    if (teamSize < 1) {
        alert("Số thành viên phải lớn hơn 0.");
        return;
    }
  
    const memberInputsDiv = document.getElementById("memberInputs");
    document.getElementById("teamDisclaimer").classList.remove("hidden");
    document.getElementById("teamResult").classList.add("hidden");
    memberInputsDiv.classList.remove("hidden");
    memberInputsDiv.innerHTML = "";
    membersData = [];

    for (let i = 0; i < teamSize; i++) {
        memberInputsDiv.innerHTML += `
            <div class="member-input-item">
                <h4>Thành viên ${i + 1}</h4>
                <textarea id="memberInput${i}" placeholder="Nhập văn bản của thành viên ${i + 1}..."></textarea>
            </div>
        `;
    }

    const predictButton = document.createElement("button");
    predictButton.textContent = "Phân tích Nhóm";
    predictButton.onclick = predictTeam;
    memberInputsDiv.appendChild(predictButton);
}

async function predictTeam() {
    const teamSize = document.getElementById("teamSize").value;
    const loadingContainer = document.getElementById("loadingTeam");
    const memberInputsDiv = document.getElementById("memberInputs");

    loadingContainer.classList.remove("hidden");
    memberInputsDiv.classList.add("hidden");
    membersData = [];

    try {
        for (let i = 0; i < teamSize; i++) {
            const text = document.getElementById(`memberInput${i}`).value;
            if (!text.trim()) throw new Error(`Văn bản của thành viên ${i + 1} không được để trống.`);

            const response = await fetch(`${API_URL}/predict`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text })
            });
            const data = await response.json();
            if (data.error) throw new Error(`Lỗi dự đoán cho thành viên ${i + 1}: ${data.error}`);
      
            const mbtiType = data.mbti_type;
            const roleInfo = mbtiData[mbtiType] || { description: "Không có thông tin.", suggestedRole: "N/A", coreRole: "N/A" };

            membersData.push({
                member: `Thành viên ${i + 1}`,
                mbtiType: mbtiType,
                binaryVector: data.binary,
                influentialTokens: data.influential_tokens || [],
                description: roleInfo.description,
                suggestedRole: roleInfo.suggestedRole,
                coreRole: roleInfo.coreRole
            });
        }
        displayTeamResults();
    } catch (error) {
        alert(`${error.message}`);
        memberInputsDiv.classList.remove("hidden");
    } finally {
        loadingContainer.classList.add("hidden");
    }
}

function displayTeamResults() {
    const teamResultDiv = document.getElementById("teamResult");
    const tableBody = document.getElementById("teamTable").querySelector('tbody');
    tableBody.innerHTML = '';
  
    membersData.forEach(member => {
        const row = tableBody.insertRow();
        row.insertCell(0).textContent = member.member;
        row.insertCell(1).textContent = member.mbtiType;
        row.insertCell(2).textContent = `[${member.binaryVector.join(", ")}]`;
        row.insertCell(3).textContent = member.description;

        const tokensCell = row.insertCell(4);
        tokensCell.innerHTML = member.influentialTokens.map(t => `<span class="influential-token">${t}</span>`).join(' ');
    
        const roleCell = row.insertCell(5);
        const roleSelector = document.createElement('select');
        roleSelector.className = 'role-selector';
        const uniqueRoles = [...new Set(Object.values(mbtiData).map(d => d.suggestedRole))];
        uniqueRoles.forEach(role => {
            const option = document.createElement('option');
            option.value = role;
            option.textContent = role;
            if (role === member.suggestedRole) option.selected = true;
            roleSelector.appendChild(option);
        });
        roleCell.appendChild(roleSelector);
    });

    teamResultDiv.classList.remove("hidden");
    suggestTeamComposition();
}

function hammingDistance(vec1, vec2) {
    return vec1.reduce((dist, val, i) => dist + (val !== vec2[i] ? 1 : 0), 0);
}

function suggestTeamComposition() {
    const suggestionDiv = document.getElementById("teamSuggestion");
    const n = membersData.length;
    if (n < 2) {
        suggestionDiv.innerHTML = `<p>Cần ít nhất 2 thành viên để phân tích sự đa dạng của nhóm.</p>`;
        return;
    }
  
    let totalDistance = 0;
    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            totalDistance += hammingDistance(membersData[i].binaryVector, membersData[j].binaryVector);
        }
    }
    const maxPossibleDistance = (n * (n - 1) / 2) * 4;
    const diversityScore = maxPossibleDistance > 0 ? (totalDistance / maxPossibleDistance * 100).toFixed(0) : 0;

    const coreRolesPresent = new Set(membersData.map(m => m.coreRole));
    const requiredRoles = ["Leader", "Planner", "Executor", "Facilitator"];
    const rolesMissing = requiredRoles.filter(role => !coreRolesPresent.has(role));
  
    let suggestionHTML = `<h4>Gợi ý cho Đội nhóm</h4>`;
    suggestionHTML += `<p>📈 **Điểm đa dạng của nhóm: ${diversityScore}%**. Điểm cao hơn cho thấy sự đa dạng về các chiều hướng tính cách.</p>`;

    if (n >= 4 && rolesMissing.length > 0) {
        suggestionHTML += `
            <p>💡 **Để cân bằng hơn, nhóm có thể đang thiếu các vai trò cốt lõi sau:**</p>
            <ul>
                ${rolesMissing.map(role => `<li><b>${getVietnameseRoleName(role)}</b></li>`).join('')}
            </ul>
        `;
    } else {
        suggestionHTML += `<p>🚀 **Tuyệt vời! Nhóm của bạn có vẻ đã rất đa dạng và cân bằng về vai trò!**</p>`;
    }
    
    suggestionDiv.innerHTML = suggestionHTML;
}

function getVietnameseRoleName(role) {
    const names = {
        "Leader": "Lãnh đạo / Điều phối",
        "Planner": "Hoạch định / Kiến trúc",
        "Executor": "Thực thi / Giải quyết vấn đề",
        "Facilitator": "Kết nối / Vận hành",
        "Innovator": "Sáng tạo / Chiến lược",
        "Supporter": "Hỗ trợ / Truyền cảm hứng"
    };
    return names[role] || role;
}

// --- THÊM LẠI CÁC HÀM ĐỂ TẢI DỮ LIỆU TEST ---
async function loadTestData() {
  await loadData("/get_test_data", "testDataContainer");
}

async function loadExternalData() {
  await loadData("/get_external_data", "externalDataContainer");
}

async function loadData(endpoint, containerId) {
    const container = document.getElementById(containerId);
    const tableBody = container.querySelector('tbody');
    
    // Ẩn container khác và hiển thị container hiện tại
    if (containerId === 'testDataContainer') {
        document.getElementById('externalDataContainer').classList.add('hidden');
    } else {
        document.getElementById('testDataContainer').classList.add('hidden');
    }
    container.classList.remove('hidden');
    tableBody.innerHTML = '<tr><td colspan="3">Đang tải và dự đoán dữ liệu...</td></tr>';

    try {
        // 1. Lấy dữ liệu ngẫu nhiên từ backend
        const res = await fetch(`${API_URL}${endpoint}`);
        const result = await res.json();
        if (result.error) throw new Error(result.error);
        
        tableBody.innerHTML = ''; 

        // 2. Với mỗi dòng dữ liệu, gọi API predict và hiển thị kết quả
        for (const item of result.data) {
            const predictRes = await fetch(`${API_URL}/predict`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: item.text })
            });
            const predictData = await predictRes.json();
            
            const row = tableBody.insertRow();
            const textCell = row.insertCell(0);
            textCell.textContent = item.text.substring(0, 150) + '...';
            textCell.title = item.text;

            row.insertCell(1).textContent = item.original_mbti;
            row.insertCell(2).textContent = predictData.success ? predictData.mbti_type : "Lỗi";
        }
    } catch (error) {
        tableBody.innerHTML = `<tr><td colspan="3">Lỗi: ${error.message}</td></tr>`;
    }
}

// --- Khởi chạy ---
document.addEventListener('DOMContentLoaded', () => {
    showTab('singlePredictor');
});