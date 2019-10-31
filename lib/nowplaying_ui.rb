require 'rspotify'
require 'tty-box'
require 'tty-screen'
require 'tty-progressbar'

module NowPlayingBox

  def printNowPlayingBox() 
    :green #1DB954
    :black #000000

    nowPlayingBox = TTY::Box.frame(align: :left, width: TTY::Screen.width - 5, height: 11, title: {top_left: '   💿  Now Playing...   '}, border: :thick, padding: 1, style: {
        fg: :green,
        border: {
          fg: :black,
          bg: :green
        }
      }) do 
        "Pause when you think you know the name.\nThe faster you guess, the higher your points!\n1st Minute:  "
        # bar = TTY::ProgressBar.new("downloading [:bar]", total: 30)
        # 30.times do
        #     sleep(1)
        #     bar.advance(1)
        # end
    end

    print nowPlayingBox

  end

end 