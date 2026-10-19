import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Tab = "today" | "missions" | "room" | "rest";
type Mission = {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  emoji: string;
  reward: number;
};
const COLORS = {
  ink: "#28372F",
  muted: "#78847D",
  sage: "#799B82",
  sageDark: "#52745D",
  mint: "#E9F1EA",
  beige: "#F7F1E8",
  cream: "#FFFCF7",
  peach: "#F5D7BF",
  line: "#E9E6DE",
  white: "#FFFFFF",
};
const MISSIONS: Mission[] = [
  {
    id: "sky",
    title: "창문을 열고 오늘의 하늘 만나기",
    description:
      "창문을 열고 하늘이나 햇빛이 들어오는 풍경을 사진으로 남겨보세요.",
    category: "초소형 · 5분",
    duration: "5분",
    emoji: "☁️",
    reward: 30,
  },
  {
    id: "walk",
    title: "집 앞을 천천히 10분 걷기",
    description:
      "목적지 없이도 괜찮아요. 발걸음이 닿는 곳까지 가볍게 걸어보세요.",
    category: "일상 · 10분",
    duration: "10분",
    emoji: "🌿",
    reward: 50,
  },
  {
    id: "cafe",
    title: "좋아하는 장소의 작은 디테일 찾기",
    description:
      "카페, 공원, 골목 어디든 좋아요. 마음에 들어온 한 장면을 기록해보세요.",
    category: "관찰 · 15분",
    duration: "15분",
    emoji: "☕",
    reward: 70,
  },
];
const FURNITURE = [
  {
    id: "plant",
    name: "초록 화분",
    emoji: "🪴",
    cost: 60,
    position: { top: 42, left: 34 },
  },
  {
    id: "lamp",
    name: "포근한 조명",
    emoji: "🛋️",
    cost: 100,
    position: { top: 122, right: 30 },
  },
  {
    id: "rug",
    name: "햇살 러그",
    emoji: "🟨",
    cost: 140,
    position: { bottom: 18, left: 84 },
  },
];

export default function Index() {
  const [profile, setProfile] = useState<{
    name: string;
    time: string;
    interests: string[];
  } | null>(null);
  const [name, setName] = useState("");
  const [time, setTime] = useState("5분");
  const [interests, setInterests] = useState<string[]>(["산책"]);
  const [tab, setTab] = useState<Tab>("today");
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [completed, setCompleted] = useState<string[]>([]);
  const [points, setPoints] = useState(80);
  const [owned, setOwned] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [relayOpen, setRelayOpen] = useState(false);
  const [relayDraft, setRelayDraft] = useState("");
  const [relaySent, setRelaySent] = useState(false);
  const [growthPopupOpen, setGrowthPopupOpen] = useState(false);
  const completionGrowth = useRef(new Animated.Value(0.15)).current;
  useEffect(() => {
    if (growthPopupOpen) {
      completionGrowth.setValue(0.15);
      Animated.spring(completionGrowth, { toValue: 1, useNativeDriver: false, friction: 5, tension: 55 }).start();
    }
  }, [growthPopupOpen, completionGrowth]);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [mailboxOpen, setMailboxOpen] = useState(false);
  const [composeMode, setComposeMode] = useState(false);
  const [messageDraft, setMessageDraft] = useState("");
  const [sentMessage, setSentMessage] = useState<string | null>(null);
  const [weeklyLetterOpen, setWeeklyLetterOpen] = useState(false);
  const [diaryOpen, setDiaryOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [diaryText, setDiaryText] = useState("");
  const [diaryMood, setDiaryMood] = useState("괜찮아요");
  const [diarySaved, setDiarySaved] = useState(false);
  const [capsuleOpen, setCapsuleOpen] = useState(false);
  const [capsuleCompose, setCapsuleCompose] = useState(false);
  const [capsuleDraft, setCapsuleDraft] = useState("");
  const [capsuleMessage, setCapsuleMessage] = useState<string | null>(null);
  const activeMission = useMemo(
    () =>
      MISSIONS.find((mission) => !completed.includes(mission.id)) ??
      MISSIONS[0],
    [completed],
  );
  const toggleInterest = (interest: string) =>
    setInterests((current) =>
      current.includes(interest)
        ? current.filter((item) => item !== interest)
        : [...current, interest],
    );
  const pickPhoto = () => setPhotoUri("demo-photo");
  const completeMission = () => {
    if (!selectedMission) return;
    if (!photoUri) {
      Alert.alert(
        "사진을 한 장 남겨볼까요?",
        "오늘의 작은 순간을 사진으로 인증하면 포인트를 받을 수 있어요.",
      );
      return;
    }
    if (!completed.includes(selectedMission.id)) {
      setCompleted((current) => [...current, selectedMission.id]);
      setPoints((current) => current + selectedMission.reward);
    }
    setFeedback("오늘도 해냈어요 🌿");
    setFeedbackOpen(false);
    setSelectedMission(null);
    setPhotoUri(null);
    setTab("missions");
    setRelayDraft("");
    setRelaySent(false);
    setRelayOpen(false);
    setGrowthPopupOpen(true);
  };
  const buyFurniture = (id: string, cost: number) => {
    if (owned.includes(id)) return;
    if (points < cost) {
      Alert.alert(
        "조금만 더 모아볼까요?",
        `${cost - points}포인트가 더 필요해요.`,
      );
      return;
    }
    setPoints((current) => current - cost);
    setOwned((current) => [...current, id]);
  };

  if (!profile)
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar style="dark" />
        <ScrollView contentContainerStyle={styles.onboarding}>
          <View style={styles.brandMark}>
            <Text style={styles.brandEmoji}>🌱</Text>
          </View>
          <Text style={styles.eyebrow}>365 SEOUL CHALLENGE</Text>
          <Text style={styles.heroTitle}>
            오늘 당신의 작은 하루를{"\n"}응원해요
          </Text>
          <Text style={styles.heroCopy}>
            부담 없는 미션 하나로{"\n"}나만의 속도로 시작해보세요.
          </Text>
          <View style={styles.onboardingCard}>
            <Text style={styles.question}>어떻게 불러드릴까요?</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="익명 닉네임 (예: 느린 토끼)"
              placeholderTextColor="#A4ADA6"
              style={styles.input}
              maxLength={12}
            />
            <Text style={styles.question}>오늘 내게 있는 여유 시간</Text>
            <View style={styles.chipRow}>
              {["5분", "15분", "30분"].map((option) => (
                <ChoiceChip
                  key={option}
                  label={option}
                  selected={time === option}
                  onPress={() => setTime(option)}
                />
              ))}
            </View>
            <Text style={styles.question}>요즘 마음이 가는 것</Text>
            <View style={styles.chipRowWrap}>
              {["산책", "카페", "독서", "사진", "음악"].map((interest) => (
                <ChoiceChip
                  key={interest}
                  label={interest}
                  selected={interests.includes(interest)}
                  onPress={() => toggleInterest(interest)}
                />
              ))}
            </View>
          </View>
          <PrimaryButton
            label="가볍게 시작하기"
            onPress={() => {
              setProfile({ name: name.trim() || "작은 하루", time, interests });
              setMailboxOpen(true);
            }}
          />
          <Text style={styles.privacyNote}>
            로그인 없이 시작해요 · 언제든 쉬어가도 괜찮아요
          </Text>
        </ScrollView>
      </SafeAreaView>
    );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.screenPad}
        showsVerticalScrollIndicator={false}
      >
        {tab === "today" && (
          <TodayScreen
            profile={profile!}
            mission={activeMission}
            completed={completed.length}
            points={points}
            feedback={feedback}
            diarySaved={diarySaved}
            onMission={() => setSelectedMission(activeMission)}
            onRoom={() => setTab("room")}
            onMailbox={() => {
              setMailboxOpen(true);
              setComposeMode(false);
              setSentMessage(null);
            }}
            onWeeklyLetter={() => setWeeklyLetterOpen(true)}
            onDiary={() => setDiaryOpen(true)}
            onReport={() => setReportOpen(true)}
            onCapsule={() => {
              setMailboxOpen(false);
              setWeeklyLetterOpen(false);
              setDiaryOpen(false);
              setReportOpen(false);
              setCapsuleOpen(true);
              setCapsuleCompose(false);
            }}
          />
        )}
        {tab === "missions" && (
          <MissionList completed={completed} onSelect={setSelectedMission} />
        )}
        {tab === "room" && (
          <RoomScreen points={points} owned={owned} onBuy={buyFurniture} />
        )}
        {tab === "rest" && <RestScreen />}
      </ScrollView>
      <View style={styles.tabBar}>
        <TabButton
          icon="☀️"
          label="오늘"
          active={tab === "today"}
          onPress={() => setTab("today")}
        />
        <TabButton
          icon="✅"
          label="미션"
          active={tab === "missions"}
          onPress={() => setTab("missions")}
        />
        <TabButton
          icon="🪴"
          label="마이룸"
          active={tab === "room"}
          onPress={() => setTab("room")}
        />
        <TabButton
          icon="☕"
          label="휴게소"
          active={tab === "rest"}
          onPress={() => setTab("rest")}
        />
      </View>
      <Modal
        visible={feedbackOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setFeedbackOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.feedbackModal}>
            <Pressable
              accessibilityLabel="팝업 닫기"
              onPress={() => setFeedbackOpen(false)}
              style={styles.modalClose}
            >
              <Text style={styles.modalCloseText}>×</Text>
            </Pressable>
            <Text style={styles.modalEmoji}>🌿</Text>
            <Text style={styles.modalTitle}>{feedback}</Text>
            <Text style={styles.modalCopy}>
              작은 한 걸음이 모여{`\n`}당신의 하루를 따뜻하게 만들어요.
            </Text>
            <Text style={styles.modalPoints}>
              +{completed.length ? "오늘의 포인트" : "포인트"}
            </Text>
          </View>
        </View>
      </Modal>
      <Modal
        visible={relayOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setRelayOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.relayModal}>
            <Pressable
              accessibilityLabel="시간차 온기 메시지 닫기"
              onPress={() => setRelayOpen(false)}
              style={styles.modalClose}
            >
              <Text style={styles.modalCloseText}>×</Text>
            </Pressable>
            <Text style={styles.relayIcon}>🌼</Text>
            <Text style={styles.mailboxEyebrow}>시간차 온기 메시지</Text>
            {relaySent ? (
              <>
                <Text style={styles.modalTitle}>따뜻함을 남겼어요</Text>
                <Text style={styles.modalCopy}>
                  다음 미션을 할 누군가에게{`\n`}당신의 한 줄이 도착할 거예요.
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.modalTitle}>
                  이전 완성자가 남긴 응원이에요
                </Text>
                <View style={styles.relayLetter}>
                  <Text style={styles.relayQuote}>
                    “작은 미션 하나를 해낸 당신, 오늘도 충분히 잘하고 있어요.
                    다음 걸음도 응원할게요.”
                  </Text>
                  <Text style={styles.letterFrom}>
                    — 먼저 이 미션을 해낸 서울의 친구
                  </Text>
                </View>
                <Text style={styles.relayPrompt}>
                  다음 사람에게도 한 줄 남겨볼까요?
                </Text>
                <TextInput
                  value={relayDraft}
                  onChangeText={setRelayDraft}
                  placeholder="따뜻한 한마디를 적어주세요"
                  placeholderTextColor="#A4ADA6"
                  style={styles.messageInput}
                  maxLength={80}
                />
                <Pressable
                  onPress={() => {
                    if (relayDraft.trim()) setRelaySent(true);
                  }}
                  style={styles.sendButton}
                >
                  <Text style={styles.sendButtonText}>
                    다음 사람에게 남기기
                  </Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </Modal>
      <Modal
        visible={mailboxOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setMailboxOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.mailboxModal}>
            <Pressable
              accessibilityLabel="마음 우체통 닫기"
              onPress={() => setMailboxOpen(false)}
              style={styles.modalClose}
            >
              <Text style={styles.modalCloseText}>×</Text>
            </Pressable>
            <Text style={styles.mailboxStamp}>✉️</Text>
            <Text style={styles.mailboxEyebrow}>마음 우체통</Text>
            {sentMessage ? (
              <>
                <Text style={styles.modalTitle}>응원을 보냈어요 🌼</Text>
                <View style={styles.sentCard}>
                  <Text style={styles.sentQuote}>“{sentMessage}”</Text>
                </View>
                <Text style={styles.modalCopy}>
                  당신의 한 줄은 잠시 뒤{`\n`}누군가의 하루에 도착할 거예요.
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.modalTitle}>
                  어제 누군가 보낸{`\n`}따뜻한 응원이 도착했어요
                </Text>
                <View style={styles.letterCard}>
                  <Text style={styles.letterQuote}>
                    “오늘의 작은 기록이 누군가에게도 용기가 되길 바라요. 저도
                    천천히 해볼게요.”
                  </Text>
                  <Text style={styles.letterFrom}>— 이름 없는 서울의 친구</Text>
                </View>
                {composeMode ? (
                  <>
                    <TextInput
                      autoFocus
                      value={messageDraft}
                      onChangeText={setMessageDraft}
                      placeholder="오늘의 작은 응원을 적어주세요"
                      placeholderTextColor="#A4ADA6"
                      style={styles.messageInput}
                      maxLength={80}
                    />
                    <Pressable
                      onPress={() => {
                        if (messageDraft.trim())
                          setSentMessage(messageDraft.trim());
                      }}
                      style={styles.sendButton}
                    >
                      <Text style={styles.sendButtonText}>따뜻하게 보내기</Text>
                    </Pressable>
                  </>
                ) : (
                  <Pressable
                    onPress={() => setComposeMode(true)}
                    style={styles.mailboxSendButton}
                  >
                    <Text style={styles.mailboxSendText}>
                      나도 응원 보내볼까요? →
                    </Text>
                  </Pressable>
                )}
                <Text style={styles.modalCopy}>
                  시간차로 도착한 익명의 응원이에요.{`\n`}우리의 작은 하루가
                  느슨하게 이어지고 있어요.
                </Text>
              </>
            )}
          </View>
        </View>
      </Modal>
      <Modal
        visible={weeklyLetterOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setWeeklyLetterOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.healingModal}>
            <Pressable
              accessibilityLabel="힐링 레터 닫기"
              onPress={() => setWeeklyLetterOpen(false)}
              style={styles.modalClose}
            >
              <Text style={styles.modalCloseText}>×</Text>
            </Pressable>
            <Text style={styles.healingIcon}>💌</Text>
            <Text style={styles.mailboxEyebrow}>일주일의 따뜻한 편지</Text>
            <Text style={styles.modalTitle}>
              스스로를 돌보기 위해{`\n`}애쓴 당신에게
            </Text>
            <View style={styles.healingLetter}>
              <Text style={styles.healingBody}>
                이번 주 당신은 창문을 열고, 천천히 걷고, 마음에 남은 장면을
                기록했어요. 아주 작은 순간처럼 보여도 그 안에는 분명 당신을
                돌보려는 다정한 마음이 있었어요.
              </Text>
              <Text style={styles.healingBody}>
                매일 완벽하지 않아도 괜찮아요. 다시 시작한 날까지 모두 당신의
                용기예요. 이번 주도 잘 살아낸 당신에게 박수를 보냅니다.
              </Text>
              <Text style={styles.healingFrom}>
                — 당신의 일주일을 지켜본 작은 친구
              </Text>
            </View>
            <Text style={styles.modalCopy}>
              매주 한 번, 지난 기록을 돌아보며 도착하는 편지예요.
            </Text>
          </View>
        </View>
      </Modal>
      <Modal
        visible={diaryOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setDiaryOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.diaryModal}>
            <Pressable
              accessibilityLabel="일기 닫기"
              onPress={() => setDiaryOpen(false)}
              style={styles.modalClose}
            >
              <Text style={styles.modalCloseText}>×</Text>
            </Pressable>
            <Text style={styles.diaryIcon}>📝</Text>
            <Text style={styles.mailboxEyebrow}>오늘의 한 줄 일기</Text>
            <Text style={styles.modalTitle}>오늘 마음은 어땠나요?</Text>
            <View style={styles.moodRow}>
              {["가벼워요", "괜찮아요", "조금 지쳐요", "마음이 무거워요"].map(
                (mood) => (
                  <Pressable
                    key={mood}
                    onPress={() => setDiaryMood(mood)}
                    style={[
                      styles.moodChip,
                      diaryMood === mood && styles.moodChipSelected,
                    ]}
                  >
                    <Text style={styles.moodChipText}>{mood}</Text>
                  </Pressable>
                ),
              )}
            </View>
            <TextInput
              value={diaryText}
              onChangeText={setDiaryText}
              placeholder="오늘 기억하고 싶은 장면을 적어주세요"
              placeholderTextColor="#A4ADA6"
              style={styles.diaryInput}
              multiline
              maxLength={120}
            />
            <Pressable
              onPress={() => {
                setDiarySaved(true);
                setDiaryOpen(false);
              }}
              style={styles.sendButton}
            >
              <Text style={styles.sendButtonText}>오늘의 마음 저장하기</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      <Modal
        visible={reportOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setReportOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.reportModal}>
            <Pressable
              accessibilityLabel="감정 리포트 닫기"
              onPress={() => setReportOpen(false)}
              style={styles.modalClose}
            >
              <Text style={styles.modalCloseText}>×</Text>
            </Pressable>
            <Text style={styles.reportIcon}>🌤️</Text>
            <Text style={styles.mailboxEyebrow}>이번 주 마음 리포트</Text>
            <Text style={styles.modalTitle}>
              마음의 날씨가{`\n`}조금씩 달라지고 있어요
            </Text>
            <View style={styles.moodChart}>
              <Text style={styles.chartText}>
                가벼워요 　● ●　 괜찮아요 ●　 조금 지쳐요 ●
              </Text>
              <View style={styles.chartLine}>
                <Text>월　 화　 수　 목　 금　 토　 일</Text>
              </View>
            </View>
            <Text style={styles.reportBody}>
              일기를 남긴 날에는 내 마음을 한 번 더 살펴볼 수 있었어요. 완벽하게
              좋아지지 않아도, 변화를 알아차린 것만으로 충분한 한 주예요.
            </Text>
            {diaryMood === "마음이 무거워요" ? (
              <View style={styles.gentleHelp}>
                <Text style={styles.gentleHelpTitle}>
                  조금 더 기대어도 괜찮아요
                </Text>
                <Text style={styles.gentleHelpCopy}>
                  마음이 무거운 날이 계속된다면 마음 휴게소에서 서울의 상담
                  지원을 가볍게 살펴보세요.
                </Text>
              </View>
            ) : (
              <Text style={styles.reportFooter}>
                다음 주에도 마음의 날씨를 천천히 기록해볼까요?
              </Text>
            )}
          </View>
        </View>
      </Modal>
      <Modal
        visible={capsuleOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setCapsuleOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.capsuleModal}>
            <Pressable
              accessibilityLabel="타임캡슐 닫기"
              onPress={() => setCapsuleOpen(false)}
              style={styles.modalClose}
            >
              <Text style={styles.modalCloseText}>×</Text>
            </Pressable>
            <Text style={styles.capsuleBigIcon}>⏳</Text>
            <Text style={styles.mailboxEyebrow}>타임캡슐 소장함</Text>
            {capsuleMessage ? (
              <>
                <Text style={styles.modalTitle}>미래의 나에게서 온 편지</Text>
                <View style={styles.capsuleLetter}>
                  <Text style={styles.capsuleLetterText}>“{capsuleMessage}”</Text>
                </View>
                <Text style={styles.modalCopy}>
                  그때의 내가 지금의 나를 꼭 안아주고 있어요.
                </Text>
              </>
            ) : capsuleCompose ? (
              <>
                <Text style={styles.modalTitle}>미래의 나에게 남길 한 줄</Text>
                <TextInput
                  autoFocus
                  value={capsuleDraft}
                  onChangeText={setCapsuleDraft}
                  placeholder="힘든 날 꺼내볼 응원을 적어주세요"
                  placeholderTextColor="#A4ADA6"
                  style={styles.capsuleInput}
                  multiline
                  maxLength={100}
                />
                <Pressable
                  onPress={() => {
                    if (capsuleDraft.trim()) {
                      setCapsuleMessage(capsuleDraft.trim());
                      setCapsuleCompose(false);
                    }
                  }}
                  style={styles.capsuleSend}
                >
                  <Text style={styles.sendButtonText}>타임캡슐에 보관하기</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Text style={styles.modalTitle}>미래의 나에게</Text>
                <Text style={styles.modalCopy}>
                  나중에 힘들 때 꺼내볼 응원 한 줄을 남겨보세요.
                </Text>
                <Pressable
                  onPress={() => setCapsuleCompose(true)}
                  style={styles.capsuleSend}
                >
                  <Text style={styles.sendButtonText}>응원 한 줄 남기기</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </Modal>
      <Modal visible={growthPopupOpen} transparent animationType="fade" onRequestClose={() => setGrowthPopupOpen(false)}>
        <View style={styles.modalBackdrop}><View style={styles.growthModal}>
          <Text style={styles.growthPopupBadge}>MISSION COMPLETE</Text>
          <Animated.Text style={[styles.growthPopupPlant, { transform: [{ scale: completionGrowth }] }]}>
            🌱
          </Animated.Text>
          <Text style={styles.modalTitle}>새싹이 자랐어요!</Text>
          <Text style={styles.modalCopy}>당신의 작은 실천이 오늘의 화분에 새로운 생명을 더했어요.</Text>
          <Pressable onPress={() => { setGrowthPopupOpen(false); setRelayOpen(true); }} style={styles.growthContinue}><Text style={styles.sendButtonText}>따뜻함 이어가기</Text></Pressable>
        </View></View>
      </Modal>
      <Modal visible={selectedMission !== null} transparent animationType="fade" onRequestClose={() => { setSelectedMission(null); setPhotoUri(null); }}>
        <View style={styles.modalBackdrop}><View style={styles.missionModal}>
          <Pressable onPress={() => { setSelectedMission(null); setPhotoUri(null); }} style={styles.modalClose}><Text style={styles.modalCloseText}>×</Text></Pressable>
          {selectedMission && <>
            <Text style={styles.missionEmoji}>{selectedMission.emoji}</Text>
            <Text style={styles.missionCategory}>{selectedMission.category}</Text>
            <Text style={styles.detailTitle}>{selectedMission.title}</Text>
            <Text style={styles.detailCopy}>{selectedMission.description}</Text>
            <View style={styles.missionSupport}>
              <Text style={styles.missionSupportIcon}>🌼</Text>
              <View style={styles.flex}>
                <Text style={styles.missionSupportTitle}>먼저 해낸 사람의 응원</Text>
                <Text style={styles.missionSupportCopy}>작은 미션 하나를 고른 당신, 오늘도 충분히 잘하고 있어요.</Text>
              </View>
            </View>
            {photoUri ? <View style={styles.photoPreview}><Text style={styles.photoPreviewIcon}>📷</Text><Text style={styles.photoPreviewText}>오늘의 순간이 담겼어요</Text></View> : <Pressable onPress={pickPhoto} style={styles.photoPicker}><Text style={styles.photoIcon}>📷</Text><Text style={styles.photoTitle}>사진으로 오늘을 남기기</Text></Pressable>}
            <PrimaryButton label={photoUri ? "인증하고 포인트 받기" : "사진 고르기"} onPress={photoUri ? completeMission : pickPhoto} />
          </>}
        </View></View>
      </Modal></SafeAreaView>
  );
}

function TodayScreen({
  profile,
  mission,
  completed,
  points,
  feedback,
  diarySaved,
  onMission,
  onRoom,
  onMailbox,
  onWeeklyLetter,
  onDiary,
  onReport,
  onCapsule,
}: {
  profile: { name: string; time: string; interests: string[] };
  mission: Mission;
  completed: number;
  points: number;
  feedback: string | null;
  diarySaved: boolean;
  onMission: () => void;
  onRoom: () => void;
  onMailbox: () => void;
  onWeeklyLetter: () => void;
  onDiary: () => void;
  onReport: () => void;
  onCapsule: () => void;
}) {
  return (
    <View>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.greeting}>좋은 하루예요, {profile.name}님</Text>
          <Text style={styles.dateText}>오늘도 작은 걸음 하나 🌿</Text>
        </View>
        <Pressable onPress={onRoom} style={styles.pointPill}>
          <Text style={styles.pointIcon}>✦</Text>
          <Text style={styles.pointText}>{points}</Text>
        </Pressable>
      </View>
      {feedback && (
        <View style={styles.feedbackCard}>
          <Text style={styles.feedbackEmoji}>🌿</Text>
          <View style={styles.flex}>
            <Text style={styles.feedbackTitle}>{feedback}</Text>
            <Text style={styles.feedbackCopy}>
              작은 한 걸음이 모여 당신의 하루를 따뜻하게 만들어요.
            </Text>
          </View>
        </View>
      )}
      <Pressable onPress={onMailbox} style={styles.mailboxCard}>
        <View style={styles.mailboxIcon}>
          <Text>✉️</Text>
        </View>
        <View style={styles.flex}>
          <Text style={styles.mailboxTitle}>
            마음 우체통에 새 응원이 도착했어요
          </Text>
          <Text style={styles.mailboxCopy}>
            익명의 서울 친구가 보낸 따뜻한 한 줄
          </Text>
        </View>
        <Text style={styles.mailboxArrow}>›</Text>
      </Pressable>
      <Pressable onPress={onWeeklyLetter} style={styles.healingCard}>
        <Text style={styles.healingCardIcon}>💌</Text>
        <View style={styles.flex}>
          <Text style={styles.healingCardTitle}>
            일주일의 따뜻한 편지가 도착했어요
          </Text>
          <Text style={styles.healingCardCopy}>
            이번 주의 작은 기록을 다정하게 돌아봐요
          </Text>
        </View>
        <Text style={styles.mailboxArrow}>›</Text>
      </Pressable>
      <Pressable onPress={onDiary} style={styles.diaryCard}>
        <Text style={styles.diaryCardIcon}>📝</Text>
        <View style={styles.flex}>
          <Text style={styles.diaryCardTitle}>
            {diarySaved
              ? "오늘의 마음을 남겼어요"
              : "오늘의 마음을 한 줄로 남겨볼까요?"}
          </Text>
          <Text style={styles.diaryCardCopy}>
            {diarySaved
              ? "일주일의 감정 리포트에 기록했어요"
              : "가벼운 기록 하나가 마음의 날씨가 돼요"}
          </Text>
        </View>
        <Text style={styles.mailboxArrow}>›</Text>
      </Pressable>
      <Pressable onPress={onReport} style={styles.reportCard}>
        <Text style={styles.reportCardIcon}>🌤️</Text>
        <View style={styles.flex}>
          <Text style={styles.reportCardTitle}>이번 주 마음 리포트 보기</Text>
          <Text style={styles.reportCardCopy}>
            내 감정의 흐름을 가볍게 살펴봐요
          </Text>
        </View>
        <Text style={styles.mailboxArrow}>›</Text>
      </Pressable>
      <Pressable onPress={onCapsule} style={styles.capsuleCard}>
        <Text style={styles.capsuleIcon}>⏳</Text>
        <View style={styles.flex}>
          <Text style={styles.capsuleTitle}>미래의 나에게 편지 보내기</Text>
          <Text style={styles.capsuleCopy}>
            나중에 힘들 때 꺼내볼 응원 한 줄을 남겨요
          </Text>
        </View>
        <Text style={styles.mailboxArrow}>›</Text>
      </Pressable>
      <View style={styles.progressCard}>
        <View style={styles.progressTop}>
          <Text style={styles.progressTitle}>오늘의 작은 기록</Text>
          <Text style={styles.progressCount}>{completed}/3 완료</Text>
        </View>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${Math.min(completed / 3, 1) * 100}%` },
            ]}
          />
        </View>
        <Text style={styles.progressCopy}>
          {completed
            ? "오늘도 나를 돌보는 중이에요."
            : "5분의 여유로 충분히 시작할 수 있어요."}
        </Text>
      </View>
      <Text style={styles.sectionTitle}>오늘의 미션</Text>
      <Pressable onPress={onMission} style={styles.featureCard}>
        <View style={styles.featureEmoji}>
          <Text style={styles.featureEmojiText}>{mission.emoji}</Text>
        </View>
        <View style={styles.flex}>
          <Text style={styles.cardKicker}>{mission.category}</Text>
          <Text style={styles.featureTitle}>{mission.title}</Text>
          <Text style={styles.featureCopy}>{mission.description}</Text>
          <View style={styles.cardBottom}>
            <Text style={styles.cardAction}>인증하러 가기 ›</Text>
            <Text style={styles.rewardSmall}>+{mission.reward}P</Text>
          </View>
        </View>
      </Pressable>
      <Text style={styles.sectionTitle}>오늘의 응원</Text>
      <View style={styles.quoteCard}>
        <Text style={styles.quoteMark}>“</Text>
        <Text style={styles.quote}>
          조금 느려도 괜찮아요.{"\n"}당신의 하루는 이미 충분히 잘 가고 있어요.
        </Text>
        <Text style={styles.quoteFrom}>— 오늘의 작은 친구</Text>
      </View>
      <View style={styles.connectionCard}>
        <Text style={styles.connectionEmoji}>🌼</Text>
        <View style={styles.flex}>
          <Text style={styles.connectionTitle}>
            오늘 128명이 같은 미션을 하고 있어요
          </Text>
          <Text style={styles.connectionCopy}>
            말을 걸지 않아도, 같은 방향을 걷고 있어요.
          </Text>
        </View>
      </View>
    </View>
  );
}
function MissionList({
  completed,
  onSelect,
}: {
  completed: string[];
  onSelect: (mission: Mission) => void;
}) {
  return (
    <View>
      <Text style={styles.pageTitle}>미션 모아보기</Text>
      <Text style={styles.pageCopy}>
        지금 내 컨디션에 맞는 작은 걸음을 골라보세요.
      </Text>
      {MISSIONS.map((mission) => (
        <Pressable
          key={mission.id}
          onPress={() => onSelect(mission)}
          style={styles.listCard}
        >
          <View style={styles.listEmoji}>
            <Text>{mission.emoji}</Text>
          </View>
          <View style={styles.flex}>
            <Text style={styles.cardKicker}>{mission.category}</Text>
            <Text style={styles.listTitle}>{mission.title}</Text>
            <Text style={styles.listCopy}>
              {mission.duration} · +{mission.reward}P
            </Text>
          </View>
          <Text
            style={
              completed.includes(mission.id) ? styles.doneBadge : styles.goBadge
            }
          >
            {completed.includes(mission.id) ? "완료" : "시작"}
          </Text>
        </Pressable>
      ))}
      <GrowthPlant completed={completed.length} />
    </View>
  );
}

function GrowthPlant({ completed }: { completed: number }) {
  const growth = useRef(new Animated.Value(0.82)).current;
  useEffect(() => {
    Animated.spring(growth, {
      toValue: 0.82 + Math.min(completed, 3) * 0.08,
      useNativeDriver: true,
      friction: 5,
      tension: 60,
    }).start();
  }, [completed, growth]);
  const stage =
    completed >= 3
      ? "🌸"
      : completed >= 2
        ? "🌿"
        : completed >= 1
          ? "🌱"
          : "🪴";
  return (
    <View style={styles.growthCard}>
      <Text style={styles.growthEyebrow}>오늘의 성장 화분</Text>
      <Animated.Text
        style={[styles.growthPlant, { transform: [{ scale: growth }] }]}
      >
        {stage}
      </Animated.Text>
      <Text style={styles.growthTitle}>
        {completed === 0
          ? "첫 미션을 완료하면 새싹이 자라요"
          : completed >= 3
            ? "오늘의 화분에 꽃이 피었어요"
            : `${completed}개의 미션으로 새싹이 자라고 있어요`}
      </Text>
      <Text style={styles.growthCopy}>
        작은 실천이 모여 마음도 천천히 자라나요.
      </Text>
      <View style={styles.growthTrack}>
        <View
          style={[
            styles.growthFill,
            { width: `${Math.min(completed / 3, 1) * 100}%` },
          ]}
        />
      </View>
    </View>
  );
}
function RoomScreen({
  points,
  owned,
  onBuy,
}: {
  points: number;
  owned: string[];
  onBuy: (id: string, cost: number) => void;
}) {
  return (
    <View>
      <View style={styles.roomHeader}>
        <View>
          <Text style={styles.pageTitle}>나의 작은 방</Text>
          <Text style={styles.pageCopy}>미션을 할수록 방이 따뜻해져요.</Text>
        </View>
        <View style={styles.pointPill}>
          <Text style={styles.pointIcon}>✦</Text>
          <Text style={styles.pointText}>{points}</Text>
        </View>
      </View>
      <View style={styles.room}>
        <Text style={styles.roomWindow}>☀️</Text>
        <Text style={styles.roomPlant}>🌿</Text>
        {FURNITURE.filter((item) => owned.includes(item.id)).map((item) => (
          <Text key={item.id} style={[styles.furniture, item.position]}>
            {item.emoji}
          </Text>
        ))}
        <Text style={styles.roomLabel}>나만의 작은 아지트</Text>
      </View>
      <Text style={styles.sectionTitle}>다음 가구</Text>
      {FURNITURE.map((item) => (
        <Pressable
          key={item.id}
          onPress={() => onBuy(item.id, item.cost)}
          style={styles.shopRow}
        >
          <Text style={styles.shopEmoji}>{item.emoji}</Text>
          <View style={styles.flex}>
            <Text style={styles.shopName}>{item.name}</Text>
            <Text style={styles.shopCost}>
              {owned.includes(item.id)
                ? "내 방에 있어요"
                : `${item.cost} 포인트`}
            </Text>
          </View>
          <Text
            style={owned.includes(item.id) ? styles.ownedText : styles.buyText}
          >
            {owned.includes(item.id) ? "✓" : "얻기"}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
function RestScreen() {
  return (
    <View>
      <Text style={styles.pageTitle}>마음 휴게소</Text>
      <Text style={styles.pageCopy}>필요할 때만, 편하게 들러주세요.</Text>
      <View style={styles.restHero}>
        <Text style={styles.restEmoji}>🌙</Text>
        <Text style={styles.restTitle}>잠깐 쉬어가도 괜찮아요</Text>
        <Text style={styles.restCopy}>
          혼자 해결하지 않아도 되는 순간을 위한 서울의 연결을 모아두었어요.
        </Text>
      </View>
      {[
        {
          title: "외로움안녕120",
          copy: "24시간 마음이 힘들 때 전화로 이야기할 수 있어요.",
          action: "120 연결 안내",
        },
        {
          title: "서울마음편의점",
          copy: "가까운 곳에서 잠깐 쉬고 상담받을 수 있는 공간이에요.",
          action: "내 주변 찾기",
        },
        {
          title: "청년마음건강",
          copy: "청년을 위한 전문 심리상담 지원을 알아보세요.",
          action: "지원사업 보기",
        },
      ].map((item) => (
        <View key={item.title} style={styles.resourceCard}>
          <Text style={styles.resourceTitle}>{item.title}</Text>
          <Text style={styles.resourceCopy}>{item.copy}</Text>
          <Text style={styles.resourceAction}>{item.action} ›</Text>
        </View>
      ))}
    </View>
  );
}
function ChoiceChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}
function PrimaryButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.primaryButton}>
      <Text style={styles.primaryText}>{label}</Text>
      <Text style={styles.primaryArrow}>→</Text>
    </Pressable>
  );
}
function TabButton({
  icon,
  label,
  active,
  onPress,
}: {
  icon: string;
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.tabButton}>
      <Text style={[styles.tabIcon, active && styles.tabIconActive]}>
        {icon}
      </Text>
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles: Record<string, any> = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.cream },
  onboarding: { padding: 24, paddingTop: 38, paddingBottom: 28 },
  screenPad: { padding: 20, paddingBottom: 110 },
  flex: { flex: 1 },
  brandMark: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: COLORS.mint,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 22,
  },
  brandEmoji: { fontSize: 28 },
  eyebrow: {
    color: COLORS.sageDark,
    letterSpacing: 1.6,
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 12,
  },
  heroTitle: {
    color: COLORS.ink,
    fontSize: 32,
    lineHeight: 40,
    fontWeight: "800",
  },
  heroCopy: {
    color: COLORS.muted,
    fontSize: 16,
    lineHeight: 25,
    marginTop: 14,
    marginBottom: 28,
  },
  onboardingCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  question: {
    color: COLORS.ink,
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 11,
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 13,
    color: COLORS.ink,
    paddingHorizontal: 15,
    height: 48,
    fontSize: 15,
    marginBottom: 22,
  },
  chipRow: { flexDirection: "row", gap: 8, marginBottom: 22 },
  chipRowWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 100,
    backgroundColor: COLORS.beige,
  },
  chipSelected: {
    backgroundColor: COLORS.mint,
    borderWidth: 1,
    borderColor: COLORS.sage,
  },
  chipText: { color: COLORS.muted, fontSize: 14 },
  chipTextSelected: { color: COLORS.sageDark, fontWeight: "700" },
  primaryButton: {
    height: 56,
    backgroundColor: COLORS.sageDark,
    borderRadius: 17,
    marginTop: 20,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 12,
  },
  primaryText: { color: COLORS.white, fontSize: 16, fontWeight: "800" },
  primaryArrow: { color: COLORS.white, fontSize: 21 },
  privacyNote: {
    color: COLORS.muted,
    fontSize: 12,
    textAlign: "center",
    marginTop: 14,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  greeting: { color: COLORS.ink, fontSize: 21, fontWeight: "800" },
  dateText: { color: COLORS.muted, marginTop: 5 },
  pointPill: {
    backgroundColor: COLORS.beige,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 100,
    flexDirection: "row",
    gap: 5,
    alignItems: "center",
  },
  pointIcon: { color: "#B57A36" },
  pointText: { color: "#9B6B30", fontWeight: "800" },
  progressCard: {
    backgroundColor: COLORS.mint,
    padding: 18,
    borderRadius: 20,
    marginBottom: 28,
  },
  progressTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  progressTitle: { color: COLORS.ink, fontWeight: "800" },
  progressCount: { color: COLORS.sageDark, fontWeight: "700" },
  progressTrack: {
    height: 8,
    backgroundColor: "#D2E1D5",
    borderRadius: 20,
    overflow: "hidden",
  },
  progressFill: { height: "100%", backgroundColor: COLORS.sageDark },
  progressCopy: { color: COLORS.sageDark, marginTop: 12, fontSize: 13 },
  sectionTitle: {
    color: COLORS.ink,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 12,
  },
  featureCard: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    padding: 16,
    flexDirection: "row",
    gap: 14,
    borderWidth: 1,
    borderColor: COLORS.line,
    marginBottom: 26,
  },
  featureEmoji: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: COLORS.beige,
    alignItems: "center",
    justifyContent: "center",
  },
  featureEmojiText: { fontSize: 30 },
  cardKicker: {
    color: COLORS.sageDark,
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 5,
  },
  featureTitle: { color: COLORS.ink, fontSize: 16, fontWeight: "800" },
  featureCopy: {
    color: COLORS.muted,
    lineHeight: 19,
    fontSize: 13,
    marginTop: 5,
  },
  cardBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  cardAction: { color: COLORS.sageDark, fontWeight: "800" },
  rewardSmall: { color: "#B57A36", fontWeight: "800" },
  quoteCard: {
    backgroundColor: COLORS.peach,
    borderRadius: 20,
    padding: 20,
    marginBottom: 14,
  },
  quoteMark: { color: "#C18E6F", fontSize: 37 },
  quote: { color: COLORS.ink, fontSize: 16, lineHeight: 24, fontWeight: "700" },
  quoteFrom: { color: "#9B7866", fontSize: 12, marginTop: 11 },
  connectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 15,
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  connectionEmoji: { fontSize: 26 },
  connectionTitle: { color: COLORS.ink, fontWeight: "700", fontSize: 13 },
  connectionCopy: { color: COLORS.muted, fontSize: 12, marginTop: 4 },
  feedbackCard: {
    backgroundColor: "#DDEBDD",
    borderRadius: 18,
    padding: 15,
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  feedbackEmoji: { fontSize: 26 },
  feedbackTitle: { color: COLORS.sageDark, fontSize: 16, fontWeight: "800" },
  feedbackCopy: {
    color: COLORS.sageDark,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(40, 55, 47, 0.42)",
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
  },
  missionModal: {
    width: "100%",
    maxWidth: 390,
    borderRadius: 26,
    backgroundColor: COLORS.cream,
    padding: 24,
    alignItems: "center",
  },
  missionSupport: { width: "100%", backgroundColor: COLORS.mint, borderRadius: 16, padding: 13, flexDirection: "row", gap: 10, alignItems: "flex-start", marginTop: 16, marginBottom: 4 }, missionSupportIcon: { fontSize: 22 }, missionSupportTitle: { color: COLORS.sageDark, fontSize: 12, fontWeight: "800" }, missionSupportCopy: { color: COLORS.sageDark, fontSize: 12, lineHeight: 18, marginTop: 3 },
  growthModal: { width: "100%", maxWidth: 360, borderRadius: 28, backgroundColor: COLORS.cream, padding: 28, alignItems: "center" }, growthPopupBadge: { color: COLORS.sageDark, fontSize: 11, fontWeight: "800", letterSpacing: 1.4, marginBottom: 14 }, growthPopupPlant: { fontSize: 92, marginVertical: 8 }, growthContinue: { width: "100%", backgroundColor: COLORS.sageDark, borderRadius: 15, paddingVertical: 14, alignItems: "center", marginTop: 20 },
  feedbackModal: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 26,
    backgroundColor: COLORS.cream,
    padding: 28,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  modalClose: {
    position: "absolute",
    top: 12,
    right: 14,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.beige,
    alignItems: "center",
    justifyContent: "center",
  },
  modalCloseText: {
    color: COLORS.muted,
    fontSize: 25,
    lineHeight: 26,
    fontWeight: "500",
  },
  modalEmoji: { fontSize: 48, marginTop: 8, marginBottom: 12 },
  modalTitle: {
    color: COLORS.ink,
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
  },
  modalCopy: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
    marginTop: 10,
  },
  modalPoints: {
    color: COLORS.sageDark,
    fontSize: 13,
    fontWeight: "800",
    marginTop: 18,
  },
  relayModal: {
    width: "100%",
    maxWidth: 390,
    borderRadius: 26,
    backgroundColor: COLORS.cream,
    padding: 24,
    alignItems: "center",
  },
  relayIcon: { fontSize: 44, marginTop: 8, marginBottom: 8 },
  relayLetter: {
    width: "100%",
    backgroundColor: COLORS.peach,
    borderRadius: 18,
    padding: 18,
    marginTop: 18,
  },
  relayQuote: {
    color: COLORS.ink,
    fontSize: 15,
    lineHeight: 23,
    fontWeight: "700",
  },
  relayPrompt: {
    color: COLORS.sageDark,
    fontSize: 13,
    fontWeight: "800",
    marginTop: 18,
    alignSelf: "flex-start",
  },
  capsuleCard: {
    backgroundColor: "#F5EEE4",
    borderRadius: 18,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "#E9DCCB",
    marginBottom: 10,
  },
  capsuleIcon: { fontSize: 25 },
  capsuleTitle: { color: COLORS.ink, fontSize: 13, fontWeight: "800" },
  capsuleCopy: { color: "#9B7866", fontSize: 12, marginTop: 4 },
  capsuleModal: {
    width: "100%",
    maxWidth: 390,
    borderRadius: 26,
    backgroundColor: COLORS.cream,
    padding: 24,
    alignItems: "center",
  },
  capsuleBigIcon: { fontSize: 46, marginTop: 8, marginBottom: 8 },
  capsuleLetter: {
    width: "100%",
    backgroundColor: COLORS.peach,
    borderRadius: 18,
    padding: 18,
    marginTop: 18,
  },
  capsuleLetterText: {
    color: COLORS.ink,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "700",
  },
  capsuleInput: {
    width: "100%",
    height: 100,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.line,
    padding: 14,
    color: COLORS.ink,
    fontSize: 14,
    textAlignVertical: "top",
    marginTop: 16,
  },
  capsuleSend: {
    width: "100%",
    backgroundColor: COLORS.sageDark,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 16,
  },
  mailboxModal: {
    width: "100%",
    maxWidth: 380,
    borderRadius: 26,
    backgroundColor: COLORS.cream,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  mailboxStamp: { fontSize: 48, marginTop: 8, marginBottom: 8 },
  mailboxEyebrow: {
    color: COLORS.sageDark,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  letterCard: {
    width: "100%",
    backgroundColor: COLORS.peach,
    borderRadius: 18,
    padding: 18,
    marginTop: 18,
  },
  letterQuote: {
    color: COLORS.ink,
    fontSize: 15,
    lineHeight: 23,
    fontWeight: "700",
  },
  letterFrom: { color: "#9B7866", fontSize: 12, marginTop: 12 },
  mailboxCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.line,
    marginBottom: 22,
  },
  mailboxIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.peach,
    alignItems: "center",
    justifyContent: "center",
    fontSize: 22,
  },
  mailboxTitle: { color: COLORS.ink, fontSize: 13, fontWeight: "800" },
  mailboxCopy: { color: COLORS.muted, fontSize: 12, marginTop: 4 },
  mailboxArrow: { color: COLORS.sageDark, fontSize: 24 },
  mailboxSendButton: {
    width: "100%",
    backgroundColor: COLORS.sageDark,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 16,
  },
  mailboxSendText: { color: COLORS.white, fontSize: 14, fontWeight: "800" },
  messageInput: {
    width: "100%",
    height: 82,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.line,
    padding: 14,
    color: COLORS.ink,
    fontSize: 14,
    textAlignVertical: "top",
    marginTop: 16,
  },
  sendButton: {
    width: "100%",
    backgroundColor: COLORS.sageDark,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
  },
  sendButtonText: { color: COLORS.white, fontSize: 14, fontWeight: "800" },
  sentCard: {
    width: "100%",
    backgroundColor: COLORS.mint,
    borderRadius: 18,
    padding: 18,
    marginTop: 18,
  },
  sentQuote: {
    color: COLORS.sageDark,
    fontSize: 15,
    lineHeight: 23,
    fontWeight: "700",
  },
  healingCard: {
    backgroundColor: "#F7E7E0",
    borderRadius: 18,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "#EACFC2",
    marginBottom: 22,
  },
  healingCardIcon: { fontSize: 26 },
  healingCardTitle: { color: COLORS.ink, fontSize: 13, fontWeight: "800" },
  healingCardCopy: { color: "#9B7866", fontSize: 12, marginTop: 4 },
  healingModal: {
    width: "100%",
    maxWidth: 390,
    borderRadius: 26,
    backgroundColor: COLORS.cream,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  healingIcon: { fontSize: 48, marginTop: 8, marginBottom: 8 },
  healingLetter: {
    width: "100%",
    backgroundColor: "#F7E7E0",
    borderRadius: 18,
    padding: 18,
    marginTop: 18,
  },
  healingBody: {
    color: COLORS.ink,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 12,
  },
  healingFrom: {
    color: "#9B7866",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 4,
  },
  growthCard: {
    backgroundColor: "#EEF5EE",
    borderRadius: 22,
    padding: 20,
    alignItems: "center",
    marginTop: 18,
    borderWidth: 1,
    borderColor: "#DCE9DE",
  },
  growthEyebrow: {
    color: COLORS.sageDark,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  growthPlant: { fontSize: 72, marginVertical: 8 },
  growthTitle: {
    color: COLORS.ink,
    fontSize: 15,
    fontWeight: "800",
    textAlign: "center",
  },
  growthCopy: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 6,
    textAlign: "center",
  },
  growthTrack: {
    width: "100%",
    height: 7,
    backgroundColor: "#D6E5D8",
    borderRadius: 8,
    overflow: "hidden",
    marginTop: 16,
  },
  growthFill: {
    height: "100%",
    backgroundColor: COLORS.sageDark,
    borderRadius: 8,
  },
  diaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.line,
    marginBottom: 10,
  },
  diaryCardIcon: { fontSize: 25 },
  diaryCardTitle: { color: COLORS.ink, fontSize: 13, fontWeight: "800" },
  diaryCardCopy: { color: COLORS.muted, fontSize: 12, marginTop: 4 },
  reportCard: {
    backgroundColor: "#EDF3F8",
    borderRadius: 18,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "#D9E6F0",
    marginBottom: 22,
  },
  reportCardIcon: { fontSize: 25 },
  reportCardTitle: { color: COLORS.ink, fontSize: 13, fontWeight: "800" },
  reportCardCopy: { color: COLORS.muted, fontSize: 12, marginTop: 4 },
  diaryModal: {
    width: "100%",
    maxWidth: 390,
    borderRadius: 26,
    backgroundColor: COLORS.cream,
    padding: 24,
    alignItems: "center",
  },
  diaryIcon: { fontSize: 42, marginTop: 8, marginBottom: 8 },
  moodRow: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
    marginTop: 16,
  },
  moodChip: {
    backgroundColor: COLORS.beige,
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  moodChipSelected: {
    backgroundColor: COLORS.mint,
    borderWidth: 1,
    borderColor: COLORS.sage,
  },
  moodChipText: { color: COLORS.sageDark, fontSize: 11, fontWeight: "700" },
  diaryInput: {
    width: "100%",
    height: 105,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.line,
    padding: 14,
    color: COLORS.ink,
    fontSize: 14,
    textAlignVertical: "top",
    marginTop: 14,
  },
  reportModal: {
    width: "100%",
    maxWidth: 390,
    borderRadius: 26,
    backgroundColor: COLORS.cream,
    padding: 24,
    alignItems: "center",
  },
  reportIcon: { fontSize: 42, marginTop: 8, marginBottom: 8 },
  moodChart: {
    width: "100%",
    backgroundColor: "#EDF3F8",
    borderRadius: 16,
    padding: 14,
    marginTop: 18,
  },
  chartText: {
    color: COLORS.sageDark,
    fontSize: 11,
    fontWeight: "700",
    lineHeight: 22,
  },
  chartLine: {
    borderTopWidth: 1,
    borderTopColor: "#D9E6F0",
    marginTop: 10,
    paddingTop: 9,
  },
  reportBody: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 22,
    marginTop: 18,
  },
  gentleHelp: {
    width: "100%",
    backgroundColor: COLORS.peach,
    borderRadius: 15,
    padding: 14,
    marginTop: 16,
  },
  gentleHelpTitle: { color: COLORS.ink, fontSize: 13, fontWeight: "800" },
  gentleHelpCopy: {
    color: "#9B7866",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
  },
  reportFooter: {
    color: COLORS.sageDark,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 18,
  },
  tabBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 80,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.line,
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 10,
  },
  tabButton: { alignItems: "center", gap: 4, width: "25%" },
  tabIcon: { fontSize: 19, opacity: 0.55 },
  tabIconActive: { opacity: 1 },
  tabLabel: { color: COLORS.muted, fontSize: 11 },
  tabLabelActive: { color: COLORS.sageDark, fontWeight: "800" },
  pageTitle: {
    color: COLORS.ink,
    fontSize: 27,
    fontWeight: "800",
    marginTop: 6,
  },
  pageCopy: {
    color: COLORS.muted,
    fontSize: 14,
    marginTop: 8,
    marginBottom: 24,
    lineHeight: 21,
  },
  listCard: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 19,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    marginBottom: 10,
  },
  listEmoji: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: COLORS.beige,
    alignItems: "center",
    justifyContent: "center",
  },
  listTitle: { color: COLORS.ink, fontSize: 15, fontWeight: "800" },
  listCopy: { color: COLORS.muted, marginTop: 5, fontSize: 12 },
  goBadge: {
    color: COLORS.sageDark,
    backgroundColor: COLORS.mint,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 100,
    fontSize: 12,
    fontWeight: "800",
  },
  doneBadge: {
    color: COLORS.muted,
    backgroundColor: COLORS.beige,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 100,
    fontSize: 12,
    fontWeight: "800",
  },
  roomHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 18,
  },
  room: {
    height: 300,
    backgroundColor: "#E9D7BF",
    borderRadius: 25,
    position: "relative",
    overflow: "hidden",
    borderWidth: 5,
    borderColor: "#D2B99C",
    marginBottom: 28,
  },
  roomWindow: { position: "absolute", top: 18, left: 20, fontSize: 35 },
  roomPlant: { position: "absolute", bottom: 35, left: 23, fontSize: 45 },
  furniture: { position: "absolute", fontSize: 37 },
  roomLabel: {
    position: "absolute",
    bottom: 12,
    alignSelf: "center",
    color: "#9C8063",
    fontSize: 12,
  },
  shopRow: {
    backgroundColor: COLORS.white,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: COLORS.line,
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 9,
  },
  shopEmoji: { fontSize: 28, width: 42, textAlign: "center" },
  shopName: { color: COLORS.ink, fontSize: 14, fontWeight: "800" },
  shopCost: { color: COLORS.muted, fontSize: 12, marginTop: 4 },
  buyText: { color: COLORS.sageDark, fontWeight: "800" },
  ownedText: { color: COLORS.muted, fontWeight: "800", fontSize: 17 },
  restHero: {
    backgroundColor: COLORS.mint,
    borderRadius: 22,
    padding: 21,
    marginBottom: 20,
  },
  restEmoji: { fontSize: 30, marginBottom: 10 },
  restTitle: { color: COLORS.ink, fontSize: 19, fontWeight: "800" },
  restCopy: {
    color: COLORS.sageDark,
    lineHeight: 21,
    marginTop: 7,
    fontSize: 13,
  },
  resourceCard: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 18,
    padding: 17,
    marginBottom: 10,
  },
  resourceTitle: { color: COLORS.ink, fontSize: 15, fontWeight: "800" },
  resourceCopy: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
  },
  resourceAction: {
    color: COLORS.sageDark,
    fontSize: 13,
    fontWeight: "800",
    marginTop: 12,
  },
  backButton: { marginBottom: 18 },
  backText: { color: COLORS.sageDark, fontSize: 15, fontWeight: "700" },
  missionHero: {
    backgroundColor: COLORS.beige,
    borderRadius: 24,
    padding: 22,
    marginBottom: 16,
  },
  missionEmoji: { fontSize: 46, marginBottom: 14 },
  missionCategory: {
    color: COLORS.sageDark,
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 8,
  },
  detailTitle: {
    color: COLORS.ink,
    fontSize: 26,
    lineHeight: 34,
    fontWeight: "800",
  },
  detailCopy: {
    color: COLORS.muted,
    lineHeight: 22,
    fontSize: 14,
    marginTop: 10,
  },
  tipCard: {
    backgroundColor: COLORS.mint,
    borderRadius: 17,
    padding: 15,
    flexDirection: "row",
    gap: 10,
    marginBottom: 18,
  },
  tipIcon: { fontSize: 20 },
  tipTitle: { color: COLORS.ink, fontWeight: "800", fontSize: 13 },
  tipCopy: {
    color: COLORS.sageDark,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 3,
  },
  photoPicker: {
    height: 190,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.sage,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FBFDFB",
  },
  photoIcon: { fontSize: 32, marginBottom: 8 },
  photoTitle: { color: COLORS.ink, fontSize: 15, fontWeight: "800" },
  photoSub: { color: COLORS.muted, fontSize: 12, marginTop: 6 },
  photoPreview: {
    width: "100%",
    height: 230,
    borderRadius: 20,
    marginBottom: 2,
    backgroundColor: COLORS.mint,
    alignItems: "center",
    justifyContent: "center",
  },
  photoPreviewIcon: { fontSize: 42, marginBottom: 8 },
  photoPreviewText: { color: COLORS.ink, fontWeight: "800", fontSize: 16 },
  photoPreviewSub: { color: COLORS.muted, fontSize: 12, marginTop: 6 },
  rewardText: {
    textAlign: "center",
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 12,
  },
});




