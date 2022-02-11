/***************************************************************
 * 디버그용 진입점 파일                                        *
 *                                                             *
 * main.js를 require하여 변수명에 대입                         *
 * browser console등에서 debugData로 코드에 접근할 수 있게 함  *
 *                                                             *
 * 파일명이나 URI옵션에 test를 넣으면 테스트 메세지 출력       *
 *                                                             *
 ***************************************************************/

// main.js를 로드하여 전역변수로 연결
debugData = require("./main.js");

debugData.Test = {};
// 테스트할 메세지 목록
debugData.Test.list = [
  // 일반 텍스트 테스트
  [
    "@badges=;color=#224466;display-name=테스트1;emotes=;flags=;mod=0;subscriber=0;turbo=0;user-id=0;user-type= :TESTER!TESTER@TESTER.tmi.twitch.tv PRIVMSG #BROADCASTER :보통 보면 이럴 때",
    "@badges=;color=#224466;display-name=테스트1;emotes=;flags=;mod=0;subscriber=0;turbo=0;user-id=0;user-type= :TESTER!TESTER@TESTER.tmi.twitch.tv PRIVMSG #BROADCASTER :온갖 개드립을 다 치던데",
    "@badges=;color=#224466;display-name=테스트1;emotes=;flags=;mod=0;subscriber=0;turbo=0;user-id=0;user-type= :TESTER!TESTER@TESTER.tmi.twitch.tv PRIVMSG #BROADCASTER :그럴만한 센스가 없네요 저는"
  ],
  [
    "@badges=;color=#224466;display-name=테스트1;emotes=;flags=;mod=0;subscriber=0;turbo=0;user-id=0;user-type= :TESTER!TESTER@TESTER.tmi.twitch.tv PRIVMSG #BROADCASTER :???",
    "@badges=bits/1000;color=#8A2BE2;display-name=테스트5;emotes=;mod=0;subscriber=0;turbo=0;user-id=0;user-type= :TESTER!TESTER@TESTER.tmi.twitch.tv PRIVMSG #BROADCASTER :?",
    "@badges=partner/1;color=;display-name=테스트3;emotes=;flags=;mod=0;subscriber=0;turbo=0;user-id=0;user-type= :TESTER!TESTER@TESTER.tmi.twitch.tv PRIVMSG #BROADCASTER :?",
    "@badges=;color=;display-name=테스트4;emotes=;flags=;mod=0;subscriber=0;turbo=0;user-id=170962099;user-type= :TESTER!TESTER@TESTER.tmi.twitch.tv PRIVMSG #BROADCASTER :??"
  ],
  [
    "@badges=premium/1;color=;display-name=테스트2;emotes=;flags=;mod=0;subscriber=0;turbo=0;user-id=0;user-type= :TESTER!TESTER@TESTER.tmi.twitch.tv PRIVMSG #BROADCASTER :뭐야",
    "@badges=premium/1;color=;display-name=테스트2;emotes=;flags=;mod=0;subscriber=0;turbo=0;user-id=0;user-type= :TESTER!TESTER@TESTER.tmi.twitch.tv PRIVMSG #BROADCASTER :ㅋㅋㅋ",
    "@badges=;color=;display-name=테스트4;emotes=;flags=;mod=0;subscriber=0;turbo=0;user-id=170962099;user-type= :TESTER!TESTER@TESTER.tmi.twitch.tv PRIVMSG #BROADCASTER :ㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋ",
    "@badges=;color=#224466;display-name=테스트1;emotes=;flags=;mod=0;subscriber=0;turbo=0;user-id=0;user-type= :TESTER!TESTER@TESTER.tmi.twitch.tv PRIVMSG #BROADCASTER :ㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋ",
    "@badges=subscriber/6;display-name=테스트6;emotes=;flags=;mod=;subscriber=1;turbo=0;user-id=0;user-type= :TESTER!TESTER@TESTER.tmi.twitch.tv PRIVMSG #BROADCASTER :ㅋㅋㅋ ㅋㅋㅋㅋㅋㅋ"
  ],
  "@badges=premium/1;color=;display-name=테스트2;emotes=;flags=;mod=0;subscriber=0;turbo=0;user-id=0;user-type= :TESTER!TESTER@TESTER.tmi.twitch.tv PRIVMSG #BROADCASTER :이 채널에 왔으면 ~이글 부터 보라구",
  "@badges=premium/1;color=;display-name=테스트2;emotes=;flags=;mod=0;subscriber=0;turbo=0;user-id=0;user-type= :TESTER!TESTER@TESTER.tmi.twitch.tv PRIVMSG #BROADCASTER :이건 뭐 어떡하라는것이지?",
  "@badges=partner/1;color=;display-name=테스트3;emotes=;flags=;mod=0;subscriber=0;turbo=0;user-id=0;user-type= :TESTER!TESTER@TESTER.tmi.twitch.tv PRIVMSG #BROADCASTER :어떡하긴 잘돌아가나 보기나 하란거지",
  "@badges=;color=;display-name=테스트4;emotes=;flags=;mod=0;subscriber=0;turbo=0;user-id=170962099;user-type= :TESTER!TESTER@TESTER.tmi.twitch.tv PRIVMSG #BROADCASTER :ㅎㅇ",
  "@badges=;color=;display-name=테스트4;emotes=;flags=;mod=0;subscriber=0;turbo=0;user-id=170962099;user-type= :TESTER!TESTER@TESTER.tmi.twitch.tv PRIVMSG #BROADCASTER :이모지도 문제 없어 👵🏿",
  "@badges=bits/1000;color=#8A2BE2;display-name=테스트5;emotes=;mod=0;subscriber=0;turbo=0;user-id=0;user-type= :TESTER!TESTER@TESTER.tmi.twitch.tv PRIVMSG #BROADCASTER :트하트하",
  "@badges=bits/1000;color=#8A2BE2;display-name=테스트5;emotes=;mod=0;subscriber=0;turbo=0;user-id=0;user-type= :TESTER!TESTER@TESTER.tmi.twitch.tv PRIVMSG #BROADCASTER :ㅋㅋ",

  // 응원 테스트
  [
    "@badges=bits/100;bits=100;color=#8A2BE2;display-name=비트테스트;emotes=;mod=0;room-subscriber=0;turbo=0;user-id=0;user-type= :TESTER!TESTER@TESTER.tmi.twitch.tv PRIVMSG #BROADCASTER :ripcheer100 비",
    "@badges=bits/100;bits=1;color=#8A2BE2;display-name=비트테스트;emotes=;mod=0;subscriber=0;turbo=0;user-id=0;user-type= :TESTER!TESTER@TESTER.tmi.twitch.tv PRIVMSG #BROADCASTER :vohiyo1 트",
    "@badges=bits/1000;bits=1000;color=#8A2BE2;display-name=비트테스트;emotes=;mod=0;subscriber=0;turbo=0;user-id=0;user-type= :TESTER!TESTER@TESTER.tmi.twitch.tv PRIVMSG #BROADCASTER :cheer1000 테스트"
  ],

  // 이모티콘 테스트
  "@badges=subscriber/6,premium/1;color=#0000FF;display-name=구독콘테스트1;emote-only=1;emotes=253633:0-12;mod=0;subscriber=1;turbo=0;user-id=0;user-type= :TESTER!TESTER@TESTER.tmi.twitch.tv PRIVMSG #BROADCASTER :igrainHitails",
  "@badges=turbo/0;color=#AA0077;display-name=구독콘테스트2;emotes=253633:3-15;flags=;mod=0;subscriber=0;turbo=0;user-id=0;user-type= :TESTER!TESTER@TESTER.tmi.twitch.tv PRIVMSG #BROADCASTER :트하 igrainHitails",
  "@badges=turbo/0;color=#AA0077;display-name=구독콘테스트2;emote-only=1;emotes=1011346:0-8,10-18,20-28,30-38,40-48;flags=;mod=0;subscriber=0;turbo=0;user-id=0;user-type= :TESTER!TESTER@TESTER.tmi.twitch.tv PRIVMSG #BROADCASTER :igrainRIP igrainRIP igrainRIP igrainRIP igrainRIP",

  "@badges=broadcaster/1;color=#74C2DB;display-name=이모티콘테스트1;emote-only=1;emotes=483:0-1;flags=;mod=0;subscriber=0;turbo=0;user-id=0;user-type= :TESTER!TESTER@TESTER.tmi.twitch.tv PRIVMSG #BROADCASTER :<3",

  // 구독 테스트
  [
    "@badges=subscriber/3,premium/1;color=#0000FF;display-name=구독테스트1;emotes=;login=TESTER;mod=0;msg-id=resub;msg-param-months=5;msg-param-sub-plan-name=SubPlanName;msg-param-sub-plan=1000;subscriber=1;system-msg=TESTER\ssubscribed\sfor\s5\smonths\sin\sa\srow!;turbo=0;user-id=0;user-type= :tmi.twitch.tv USERNOTICE #BROADCASTER",
    "@badges=subscriber/3,premium/1;color=#0000FF;display-name=구독테스트1;emotes=;login=TESTER;mod=0;subscriber=1;turbo=0;user-id=0;user-type= :tmi.twitch.tv PRIVMSG #BROADCASTER :아 구독메세지 안씀",
    "@badges=subscriber/6;color=#EEEEEE;display-name=구독테스트2;emotes=;login=TESTER;mod=0;msg-id=resub;msg-param-months=8;msg-param-sub-plan-name=SubPlanName;msg-param-sub-plan=2000;subscriber=1;system-msg=TESTER\ssubscribed\sfor\s8\smonths\sin\sa\srow!;turbo=0;user-id=0;user-type= :tmi.twitch.tv USERNOTICE #BROADCASTER :ㅋㅋㅋ 한달 버림 ㅊㅋㅊㅋ"
  ],

  // 구독 선물 테스트
  "@badges=subscriber/24,twitchcon2018/1;color=#39008A;display-name=구독선물테스트;emotes=;flags=;login=TESTER;mod=0;msg-id=subgift;msg-param-months=1;msg-param-recipient-display-name=받을사람;msg-param-recipient-id=0;msg-param-recipient-user-name=RECIPIENT;msg-param-sender-count=1;msg-param-sub-plan-name=SubPlanName;msg-param-sub-plan=1000;subscriber=1;system-msg=TESTER\sgifted\sa\sTier\s1\ssub\sto\s받을사람!\sThis\sis\stheir\sfirst\sGift\sSub\sin\sthe\schannel!;turbo=0;user-id=0;user-type= :tmi.twitch.tv USERNOTICE #BROADCASTER",

  // 링크 테스트
  "@badges=subscriber/3,turbo/1;color=#003CB4;display-name=클립테스트1;emotes=;mod=0;subscriber=1;turbo=1;user-id=0;user-type= :TESTER!TESTER@TESTER.tmi.twitch.tv PRIVMSG #BROADCASTER :https://clips.twitch.tv/DeafCuriousPeanutMikeHogu?tt_content=video_thumbnail",
  "@badges=;color=;display-name=클립테스트2;emotes=;flags=;subscriber=0;turbo=0;user-id=0;user-type= :TESTER!TESTER@TESTER.tmi.twitch.tv PRIVMSG #BROADCASTER :https://clips.twitch.tv/IgnorantSpikyPiePoooound?tt_content=video_title",
  [
    "@badges=broadcaster/1;color=#FFFFFF;display-name=클립테스트3;emotes=;flags=;subscriber=0;turbo=0;user-id=0;user-type= :TESTER!TESTER@TESTER.tmi.twitch.tv PRIVMSG #BROADCASTER :https://clips.twitch.tv/SomeWrongClip 틀린 링크는 표시가 안 돼요",
    "@badges=broadcaster/1;color=#FFFFFF;display-name=클립테스트3;emotes=;flags=;subscriber=0;turbo=0;user-id=0;user-type= :TESTER!TESTER@TESTER.tmi.twitch.tv PRIVMSG #BROADCASTER :하긴 틀린 링크니까 당연한가 이거나 보세요 https://www.twitch.tv/silverstream9173/clip/ArborealSuccessfulEagleSuperVinlin?filter=clips&range=all&sort=time"
  ],
  "@badges=;color=#8A2BE2;display-name=유튜브테스트;emotes=;flags=;mod=0;subscriber=0;turbo=0;user-id=0;user-type= :TESTER!TESTER@TESTER.tmi.twitch.tv PRIVMSG #BROADCASTER :이건 보고 트위치하고계십니까 https://www.youtube.com/watch?v=2bVgU2Tje84 J.E.B는 진리야"
];

/**
 * 목록에 설정 로드가 필요한 테스트 메세지를 추가
 */
debugData.Test.Append = function() {
  var list = [
    // 트윕 테스트
    [
      `@badges=turbo/1;color=#000000;display-name=트윕테스트;emotes=;mod=0;subscriber=0;turbo=1;user-id=0;user-type= :TESTER!TESTER@TESTER.tmi.twitch.tv PRIVMSG #BROADCASTER : ${debugData.Data.config.Message.Twip.Format.replace("{name}","트윕테스트").replace("{value}","10000").replace("{text}","일반 유저가 말하면 이렇지만")}`,
      `@badges=moderator/1,subscriber/0,partner/1;color=#C20A85;display-name=Twipkr;emotes=;mod=1;subscriber=1;turbo=0;user-id=115581168;user-type=mod :twipkr!twipkr@twipkr.tmi.twitch.tv PRIVMSG #yeokka :ACTION ${debugData.Data.config.Message.Twip.Format.replace("{name}","트윕테스트").replace("{value}","10000").replace("{text}","트윕의 채팅이라면 이렇게")}`
    ],

    // 전용 이미지 테스트
    `@badges=bits/100;color=#8A2BE2;display-name=이미지테스트;emotes=;mod=0;subscriber=0;turbo=0;user-id=0;user-type= :TESTER!TESTER@TESTER.tmi.twitch.tv PRIVMSG #BROADCASTER :${(Object.keys(debugData.Message.Module.Orimg.list||{}).length>0? debugData.Data.config.Message.Orimg.Prefix+Object.keys(debugData.Message.Module.Orimg.list)[0]:"전용이미지가 한 개도 없네..")}`
  ];
  debugData.Test.list = debugData.Test.list.concat(list);
};

/**
 * 목록에서 메세지를 하나씩 꺼내어 출력
 * 목록이 비면 목록 생성 메서드를 호출
 */
debugData.Test.Send = function(list) {
  debugData.Irc.Response(list.shift());
  if (list.length === 0) { debugData.Test.Run(); }
  else{ setTimeout( ()=>{debugData.Test.Send(list);}, 500+2500*Math.random()); }
};

/**
 * 목록 생성 메서드
 * 메세지 목록을 섞어 실제 사용할 목록을 만들어 출력 메서드를 호출
 */
debugData.Test.Run = function() {
  if (debugData.Test.list.length === 0) { return; }

  // 목록을 섞고 호출
  var list = debugData.Test.list.sort(()=>.5-Math.random()).reduce( function(acc, cur) {
    if (typeof cur === "string") { acc.push(cur); }
    else if (Array.isArray(cur)) {
      cur.forEach( function(str) { acc.push(str); } );
    }
    return acc;
  }, []);
  setTimeout( ()=>{debugData.Test.Send(list);}, 5000 );
};

/**
 * 연결 해제 메서드
 * 설정이 로드되면 설정이 필요한 다른 메서드를 호출
 * 이후 테스트를 방해하는 기존 IRC의 연결을 해제
 */
debugData.Test.DisConnect = function() {
  if (debugData.Done.list.message === true) {
    debugData.Test.Append();
    debugData.Irc.socket.send(`QUIT\r\n`);
  } else {
    // 연결이 완료될때까지 반복
    setTimeout( ()=>{debugData.Test.DisConnect();}, 5000 );
  }
};

/**
 * 실행 여부 판별
 * 파일 이름에 test가 포함되거나 URI 옵션에 test가 있을 경우 테스트를 실행
 */
(
  function() {
    var cond1 = location.href.split("/").reverse()[0].indexOf("test") !== -1;
    var cond2 = location.href.split("?").reverse()[0].split("&").some(
      function(el) { return (el.split("=")[0].toLowerCase() === "test"); }
    );

    if (cond1 || cond2) {
      debugData.Test.Run();
      debugData.Test.DisConnect();
    }
  }
)();