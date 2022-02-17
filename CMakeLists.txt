cmake_minimum_required(VERSION 3.0)
project (ylrtc)

if(NOT CMAKE_BUILD_TYPE AND NOT CMAKE_CONFIGURATION_TYPES)
  message("Setting build type to 'Debug' as none was specified.")
  set(CMAKE_BUILD_TYPE Debug CACHE STRING "Choose the type of build." FORCE)
  # Set the possible values of build type for cmake-gui
  set_property(CACHE CMAKE_BUILD_TYPE PROPERTY STRINGS "Debug" "Release"
    "MinSizeRel" "RelWithDebInfo")
endif()
set (CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -std=c++17 -fsanitize=address" CACHE STRING "Set C++ Compiler Flags" FORCE)

include_directories(${CMAKE_CURRENT_SOURCE_DIR}
  ${CMAKE_CURRENT_SOURCE_DIR}/thirdparty_dir/include src/base ${CMAKE_CURRENT_SOURCE_DIR}/src/ice
  ${CMAKE_CURRENT_SOURCE_DIR}/src/rtp_rtcp ${CMAKE_CURRENT_SOURCE_DIR}/src/signaling
  ${CMAKE_CURRENT_SOURCE_DIR}/src/transport ${CMAKE_CURRENT_SOURCE_DIR}/src/dtls_srtp
  ${CMAKE_CURRENT_SOURCE_DIR}/src/congestion_controller ${CMAKE_CURRENT_SOURCE_DIR}/src/)

link_directories(${CMAKE_CURRENT_SOURCE_DIR}/thirdparty_dir/lib)

set(LINK_LIBRARYS sdptransform srtp2 ssl crypto spdlog boost_thread dl bz2 lzma z pthread)
file(GLOB LIB_SRC_LIST ./src/base/*.cpp ./src/ice/*.cpp
  ./src/rtp_rtcp/*.cpp ./src/signaling/*.cpp ./src/transport/*.cpp ./src/dtls_srtp/*.cpp
  ./src/congestion_controller/*.cpp)
LIST(FILTER LIB_SRC_LIST EXCLUDE REGEX _unittest.cpp$)
add_library(${PROJECT_NAME}-lib STATIC ${LIB_SRC_LIST})
target_link_libraries(${PROJECT_NAME}-lib ${LINK_LIBRARYS})

add_executable(${PROJECT_NAME} ./src/main.cpp)
target_link_libraries(${PROJECT_NAME} ${PROJECT_NAME}-lib)
file(GLOB TEST_SRC_LIST ./src/base/*_unittest.cpp ./src/ice/*_unittest.cpp
  ./src/rtp_rtcp/*_unittest.cpp ./src/signaling/*_unittest.cpp
  ./src/transport/*_unittest.cpp ./src/dtls_srtp/*_unittest.cpp
  ./src/congestion_controller/*_unittest.cpp ./src/test_main.cpp)
add_executable(${PROJECT_NAME}_test ${TEST_SRC_LIST})
target_link_libraries(${PROJECT_NAME}_test ${PROJECT_NAME}-lib gtest)