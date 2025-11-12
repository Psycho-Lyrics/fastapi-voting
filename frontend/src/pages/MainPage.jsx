import {Rocket } from "lucide-react";
import {BlueButton} from "../components/Button";
import { useState, useEffect } from "react";
import {Link, Navigate} from "react-router-dom";
import Calendar from "../components/main/Calendar";
import { ActualVoteCard, MinInfoVoteCard } from "../components/main/VoteCard";
import { LinkText } from "../components/main/Components";
import { Chart2 } from "../components/main/Charts";
import { getProfileData, getVotingData } from "../services/api";
import {
  formatDate,
  formatTime,
  getVotingStatusConfig,
} from "../components/votes/Formatters";

// --- Вспомогательные функции ---
const getLast24HoursGrowth = (allVotings) => {
  if (!Array.isArray(allVotings) || allVotings.length === 0) return 0;

  const now = new Date();
  const oneHour = 60 * 60 * 1000;

  let last24 = 0;
  let prev24 = 0;

  for (const voting of allVotings) {
    const hourlyData = voting.registrations_per_hour || [];

    for (const item of hourlyData) {
      const itemTime = new Date(item.hour);
      const diffMs = now - itemTime;
      const diffHours = diffMs / oneHour;

      if (diffHours <= 24) {
        last24 += item.votes;
      } else if (diffHours <= 48) {
        prev24 += item.votes;
      }
    }
  }

  if (prev24 === 0) return last24 > 0 ? 100 : 0;
  return Math.round(((last24 - prev24) / prev24) * 100);
};

const getLast12DaysRegistrations = (allVotings) => {
  const days = Array(12).fill(0);
  const now = new Date();
  const oneDay = 24 * 60 * 60 * 1000;

  const allRegistrations = allVotings.flatMap(
    (voting) => voting.registrations_per_hour || []
  );

  for (const item of allRegistrations) {
    const itemDate = new Date(item.hour);
    const diffDays = Math.floor((now - itemDate) / oneDay);

    if (diffDays >= 0 && diffDays < 12) {
      days[diffDays] += item.votes;
    }
  }

  return days.reverse();
};

// --- Карточка голосования ---
const VotingCard = ({ voting, height = "h-[450px]" }) => {
  const statusConfig = getVotingStatusConfig(voting);
  const totalRegistered = voting.registered_users?.length || 0;

  const chartData =
    statusConfig.text === "Голосование на этапе регистрации"
      ? voting.registrations_per_hour?.map((item) => item.votes) || []
      : voting.votes_per_hour?.map((item) => item.votes) || [];

  const chartTitle =
    statusConfig.text === "Голосование на этапе регистрации"
      ? "Динамика регистрации"
      : "Динамика голосов";

  const deadlines =
    statusConfig.text === "Голосование на этапе регистрации"
      ? `C ${formatDate(voting.registration_start)} по ${formatDate(
          voting.registration_end
        )}`
      : `C ${formatDate(voting.voting_start)} по ${formatDate(
          voting.voting_end
        )}`;

  return (
    <div
      className={`bg-white rounded-[20px] inline-flex flex-col justify-between p-5 ${height} max-md:h-auto max-md:p-4`}
    >
      <p className="font-bold text-xl max-md:text-lg line-clamp-2">
        {voting.title}
      </p>
      <p className="font-normal text-base text-[#CCCCCC] max-md:text-sm">
        {voting.theme}
      </p>

      <div
        className={`${statusConfig.bg} ${statusConfig.textColor} rounded-lg px-3 py-3 max-md:py-1 inline-flex items-center gap-1 max-w-fit`}
      >
        {statusConfig.icon}
        <p className="text-sm font-medium max-md:text-xs">
          {statusConfig.text}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 max-md:grid-cols-1">
        <div className="col-span-1 rounded-2xl flex flex-col justify-between border-1 border-[#ccc] h-[150px] p-4 max-md:h-auto max-md:p-3">
          <p className="text-base font-normal text-[#212121] max-md:text-sm">
            Зарегистрировано пользователей
          </p>
          <div className="flex items-center gap-2">
            <p className="text-[32px] font-bold max-md:text-[24px]">
              {totalRegistered}
            </p>
            {(() => {
              const growth = getLast24HoursGrowth([voting]);
              const isPositive = growth >= 0;
              return (
                <p
                  className={`font-medium rounded-lg p-1 max-md:text-sm ${
                    isPositive
                      ? "bg-[#E6FFDD] text-[#135617]"
                      : "bg-[#FFEBE6] text-[#C63B2E]"
                  }`}
                >
                  {isPositive ? "+" : ""}
                  {growth}%
                </p>
              );
            })()}
          </div>
          <p className="text-base font-normal text-[#ccc] max-md:text-xs">
            За последние 24 часа
          </p>
        </div>
        <div className="col-span-1 rounded-2xl border-1 border-[#ccc] h-[150px] max-md:h-auto">
          <Chart2
            chartData={chartData}
            title={chartTitle}
            deadlines={deadlines}
            className="max-md:h-32"
          />
        </div>
        <Link to={`/votes/${voting.id}`}>
          <BlueButton className="max-md:py-2 w-full">
            <p className="max-md:text-sm">Детали голосования</p>
          </BlueButton>
        </Link>
      </div>
    </div>
  );
};

// --- Основной компонент ---
const MainPage = () => {
  const heights = [
    "30%",
    "45%",
    "60%",
    "25%",
    "75%",
    "90%",
    "35%",
    "50%",
    "65%",
    "80%",
    "95%",
    "44%",
  ];
  const colors = ["#BD3636", "#FFE3E3", "#E87C7C", "#F2A4A4"];

  const [roleId, setRoleId] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [votings, setVotings] = useState([]);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchData = async () => {
    try {
      // 1. Получаем роль и id пользователя
      const userData = await userInfo();
      setRoleId(userData.role_id);
      setUserProfile(userData);

      // 2. Получаем профиль (с голосованиями)
      const profileData = await getProfileData();
      const profile = profileData.profile || profileData;

      // 3. Загружаем детали голосований
      let votingIds = [];

      if (userData.role_id === 3 && profile.creator_votings) {
        // Админ: берем последние 3 созданных голосования
        votingIds = [...profile.creator_votings].sort((a, b) => b.id - a.id).slice(0, 3);
      } else if (userData.role_id !== 3 && profile.registered_votings) {
        // Пользователь (1 или 2): берем до 2 зарегистрированных
        votingIds = profile.registered_votings.slice(0, 2);
      }

      // Если нет голосований — останавливаемся
      if (votingIds.length === 0) {
        setVotings([]);
        return;
      }

      // Загружаем полные данные по каждому ID
      const detailedVotings = await Promise.all(
        votingIds.map(async (voting) => {
          try {
            const fullData = await getVotingData(voting.id);
            return { ...voting, ...fullData.voting_full_info };
          } catch (err) {
            console.error(`Ошибка загрузки голосования ${voting.id}:`, err);
            return { ...voting }; // Возвращаем базовую информацию
          }
        })
      );

      setVotings(detailedVotings);
    } catch (err) {
      console.error("Ошибка загрузки данных:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);

  if (loading) {
    return <div className="text-center mt-10">Загрузка...</div>;
  }

  if (roleId === null) {
    return (
        <Navigate to="/login" replace />
    );
  }

  return (
    <>
      {/* Главный баннер (только для не-админов) */}
      {roleId !== 3 && (
        <div className="relative 2xl:px-40 lg:px-10 px-1 -z-1">
          <p className="mak text-[40px] mb-5 text-white absolute mt-16 ml-20 max-lg:ml-5 max-lg:mt-10 max-md:text-[32px] max-md:mt-8">
            Главная
          </p>
          <img
            className="rounded-[20px] object-cover w-full"
            src="/src/assets/images/detaliandMain/bfbfe1dc293cbe00c215ff63f52772875e1e8d9c.png"
            alt=""
          />
          <p className="text-[48px] text-white absolute bottom-[40px] ml-20 uppercase font-bold w-1/3 max-lg:ml-5 max-lg:text-[36px] max-md:text-[28px] max-md:w-2/3 max-sm:text-[24px] max-sm:bottom-[20px]">
            криптоголосвание на блокчейне
          </p>
        </div>
      )}

      <div
        className={`3xl:mx-80 2xl:mx-60 lg:mx-20 mx-3 ${
          roleId === 3 ? "my-[99px]" : "mb-[99px] mt-3"
        } text-[#212121] max-md:mx-2 max-sm:mx-1`}
      >
        {/* Заголовок "Главная" для админа */}
        {roleId === 3 && (
          <p className="mak text-[40px] mb-5 max-md:text-[32px]">Главная</p>
        )}

        {/* Статистика: 3.000 голосований, 4.000.000 транзакций и т.д. */}
        <div className="grid grid-cols-6 gap-2 max-lg:grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-1">
          <div className="bg-white col-span-1 h-50 rounded-[20px] flex flex-col justify-center p-5 max-sm:col-span-1 max-md:col-span-2">
            <p className="text-[38px] font-bold max-md:text-[32px] max-sm:text-[28px]">
              3.000
            </p>
            <p className="text-base font-light max-sm:text-sm">Голосований</p>
          </div>
          <div className="bg-white col-span-2 h-50 rounded-[20px] p-5 relative overflow-hidden max-sm:col-span-1">
            <div className="flex flex-col justify-center h-full">
              <p className="text-[38px] font-bold max-md:text-[32px] max-sm:text-[28px]">
                4.000.000
              </p>
              <p className="text-base font-base max-sm:text-sm">Транзакций</p>
              <img
                className="h-full absolute right-0 max-md:h-4/5 max-sm:h-3/4"
                src="/src/assets/images/detaliandMain/img1.svg"
                alt=""
              />
            </div>
          </div>
          <div className="bg-white col-span-1 h-50 rounded-[20px] flex flex-col justify-center p-5 max-sm:col-span-1 max-md:col-span-2">
            <p className="text-[38px] font-bold max-md:text-[32px] max-sm:text-[28px]">
              150
            </p>
            <p className="text-[18px] font-base max-sm:text-base">
              Администраторов
            </p>
          </div>
          <div className="bg-white col-span-2 h-50 rounded-[20px] p-5 relative overflow-hidden max-sm:col-span-1 max-md:col-span-2">
            <div className="flex flex-col justify-center h-full">
              <p className="text-[38px] font-bold max-md:text-[32px] max-sm:text-[28px]">
                1.500
              </p>
              <p className="text-base font-base max-sm:text-sm">
                Уникальных пользователей
              </p>
              <img
                className="h-full absolute right-0 max-md:h-4/5 max-sm:h-3/4"
                src="/src/assets/images/detaliandMain/img2.svg"
                alt=""
              />
            </div>
          </div>
        </div>

        {/* Управление голосованием (только для админа) */}
        {roleId === 3 && (
          <>
            <p className="mak text-[40px] mb-5 mt-[99px] max-md:text-[32px] max-md:mt-[60px]">
              Управление голосованием
            </p>
            <div className="flex gap-2 max-lg:flex-col">
              <div className="flex flex-col gap-2 w-5/11 max-lg:w-full">
                <div className="bg-white rounded-[20px] px-6 py-8 max-h-100 flex gap-2 max-lg:flex-col max-md:px-4 max-md:py-5">
                  <div className="col-span-3 flex flex-col justify-between h-full max-lg:order-2">
                    <p className="font-bold text-xl leading-5 max-md:text-base">
                      Ваш голос — неприкосновенен.
                    </p>
                    <p className="text-base font-base leading-5 max-md:text-sm">
                      Участвуйте в голосованиях с криптографической защитой, где
                      каждый выбор остаётся в вечном блокчейне. Влияйте на
                      решения по-настоящему — без посредников, без
                      фальсификаций. Присоединяйтесь к революции прозрачных
                      решений!
                    </p>
                    <Link to="/constructor">
                      <BlueButton className="max-md:py-2">
                        <Rocket className="max-md:w-4 max-md:h-4" />
                        <p className="font-medium text-base max-md:text-sm">
                          Создать голосование
                        </p>
                      </BlueButton>
                    </Link>
                  </div>
                  <img
                    className="col-span-2 h-full rounded-[12px] max-lg:order-1 max-lg:w-full max-lg:h-48 max-md:h-40"
                    src="/src/assets/images/detaliandMain/ca5f98a87def00ad482c1f2027c8e36dd917f611.png"
                    alt=""
                  />
                </div>

                {votings.length > 0 && (
                  <VotingCard voting={votings[0]} height="h-[481px]" />
                )}
              </div>

              <div className="flex flex-col gap-2 w-6/11 max-lg:w-full">
                {votings.length > 1 && (
                  <VotingCard voting={votings[1]} height="h-[431px]" />
                )}
                {votings.length > 2 && (
                  <VotingCard voting={votings[2]} height="h-[450px]" />
                )}
              </div>
            </div>
          </>
        )}

        {/* Общая статистика */}
        {roleId === 3 && (
          <p className="mak text-[40px] mb-5 mt-[99px] max-md:text-[32px] max-md:mt-[60px]">
            Общая статистика
          </p>
        )}

        {/* Мои голосования и Актуальные (для не-админов) */}
        {roleId !== 3 && (
          <div className="grid grid-cols-9 gap-2 mt-2 max-lg:grid-cols-1 max-lg:gap-4">
            <div className="bg-white rounded-[20px] col-span-5 h-[782px] flex flex-col justify-between p-6 max-lg:col-span-1 max-md:h-auto max-md:p-4">
              <p className="font-semibold text-2xl max-md:text-xl">
                Мои голосования
              </p>
              <div className="flex flex-col gap-4 max-md:gap-3">
                {votings.length === 0 ? (
                  <p className="text-gray-500 max-md:text-sm">
                    У вас пока нет голосований
                  </p>
                ) : (
                  votings.map((voting) => (
                    <MinInfoVoteCard
                      key={voting.id}
                      title={voting.title}
                      description={voting.theme || "Тема не указана"}
                      timezone={"(UTC+3) Россия - Москва (MSK)"}
                      date={formatDate(voting.voting_start)}
                      time={formatTime(voting.voting_start)}
                      className="max-md:p-3"
                    />
                  ))
                )}
              </div>
              <LinkText
                title={"Показать больше"}
                size={"text-xl max-md:text-lg"}
                width={"font-semibold"}
              />
            </div>
            <div className="bg-white rounded-[20px] col-span-4 h-[782px] p-6 max-lg:col-span-1 max-md:h-auto max-md:p-4">
              <p className="font-bold text-xl max-md:text-lg">Актуальные</p>
              {votings.length > 0 ? (
                <ActualVoteCard
                  title={votings[0].title}
                  startdate={formatDate(votings[0].voting_start)}
                  starttime={formatTime(votings[0].voting_start)}
                  enddate={formatDate(votings[0].voting_end)}
                  endtime={formatTime(votings[0].voting_end)}
                  progress={65}
                  className="max-md:p-3"
                />
              ) : (
                <p className="text-gray-500 max-md:text-sm">
                  Нет актуальных голосований
                </p>
              )}
            </div>
          </div>
        )}

        {/* Графики и статистика */}
        <div
          className={`grid ${
            roleId === 3 ? "grid-cols-3" : "grid-cols-6 grid-rows-1 mt-2"
          } gap-2 max-lg:grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-1`}
        >
          {/* График регистраций */}
          <div
            className={`bg-white rounded-[20px] flex flex-col ${
              roleId !== 3 && "col-span-2 row-span-1"
            } justify-between h-86 p-5 max-md:p-4 max-sm:col-span-3 w-auto`}
          >
            <p className="font-bold text-xl max-md:text-lg">
              Регистрация и голосование
            </p>
            <p className="font-normal text-base text-[#CCCCCC] max-md:text-sm">
              Соотношение регистраций и голосов
            </p>
            <div className="grid grid-cols-12 gap-1 h-40 md:h-40 items-end max-md:h-32">
              {getLast12DaysRegistrations(votings).map((count, index) => {
                const maxCount = Math.max(
                  ...getLast12DaysRegistrations(votings),
                  1
                );
                const height = `${(count / maxCount) * 100}%`;
                return (
                  <div
                    key={index}
                    className="rounded-sm transition-all duration-300 hover:opacity-80"
                    style={{
                      height,
                      backgroundColor: count > 0 ? "#7DD4FF" : "#E0E0E0",
                    }}
                    title={`${count} регистраций`}
                  />
                );
              })}
            </div>
            <div className="flex justify-between max-md:text-sm pt-2">
              {Array(12)
                .fill(0)
                .map((_, i) => {
                  const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
                  const day = String(d.getDate()).padStart(2, "0");
                  return (
                    <p
                      key={i}
                      className="font-normal text-base text-[#CCCCCC] max-md:text-sm"
                    >
                      {day}
                    </p>
                  );
                })
                .reverse()}
            </div>
          </div>

          {/* Календарь */}
          {roleId !== 3 && (
            <div className="bg-white rounded-[20px] max-h-[640px] col-span-4 row-span-2 sm:top-[-40px] p-5 max-lg:col-span-3 max-md:col-span-2 max-sm:col-span-3 max-md:p-4">
              <p className="font-bold text-xl max-md:text-lg">
                Календарь голосований
              </p>
              <Calendar className="max-md:text-sm" />
            </div>
          )}

          {/* Количество голосующих */}
          <div
            className={`bg-white rounded-[20px] flex flex-col ${
              roleId !== 3 && "col-span-2 row-span-1"
            } justify-between h-86 p-5 max-md:p-4 max-sm:col-span-3 w-auto`}
          >
            <p className="font-bold text-xl max-md:text-lg">
              Количество голосующих
            </p>
            <p className="font-normal text-base text-[#CCCCCC] max-md:text-sm">
              Всего проголосовало
            </p>
            <div className="relative w-fit">
              <p className="text-[96px] font-bold max-md:text-[72px] max-sm:text-[48px]">
                {votings.reduce(
                  (sum, v) => sum + (v.registered_users?.length || 0),
                  0
                )}
              </p>
              {(() => {
                const growth = getLast24HoursGrowth(votings);
                const isPositive = growth >= 0;
                return (
                  <p
                    className={`bg-${
                      isPositive ? "[#E6FFDD]" : "[#FFEBE6]"
                    } text-${
                      isPositive ? "[#135617]" : "[#C63B2E]"
                    } absolute top-3 -right-20 rounded-lg p-1 max-md:text-sm max-md:-right-16 max-sm:-right-12 max-sm:top-1 max-sm:text-xs`}
                  >
                    {isPositive ? "+" : ""}
                    {growth}%
                  </p>
                );
              })()}
            </div>
            <p className="font-normal text-base text-[#CCCCCC] max-md:text-sm">
              В период с 10.06.2025 по 10.07.2025
            </p>
          </div>

          {/* Вертикальный график для админа */}
          {roleId === 3 && (
            <div className="bg-white rounded-[20px] flex flex-col justify-between h-86 p-5 max-md:p-4 max-lg:col-span-3">
              <p className="font-bold text-xl max-md:text-lg">
                Регистрация и голосование
              </p>
              <p className="font-normal text-base text-[#CCCCCC] max-md:text-sm">
                Соотношение регистраций и голосов
              </p>
              <div className="flex flex-col gap-1 w-full">
                <div
                  className="bg-[#FFD17D] rounded-sm max-md:h-[50px]"
                  style={{
                    height: "62.5px",
                    width: `${Math.min(
                      100,
                      ((votings[0]?.registered_users?.length || 0) / 1000) * 100
                    )}%`,
                  }}
                ></div>
                <div
                  className="bg-[#7DD4FF] rounded-sm max-md:h-[50px]"
                  style={{
                    height: "62.5px",
                    width: `${Math.min(
                      100,
                      ((votings[0]?.registered_users?.length || 0) / 1500) * 100
                    )}%`,
                  }}
                ></div>
              </div>
              <p className="font-normal text-base text-[#CCCCCC] max-md:text-sm">
                В период с 10.06.2025 по 10.07.2025
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MainPage;
