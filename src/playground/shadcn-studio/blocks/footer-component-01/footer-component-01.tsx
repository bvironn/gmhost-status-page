import { FacebookIcon, InstagramIcon, TwitterIcon, YoutubeIcon } from 'lucide-react';

import Logo from '@/playground/shadcn-studio/logo';

const Footer = () => {
  return (
    <footer className='relative border-t border-white/10 bg-transparent text-zinc-300'>
      <div className='mx-auto flex max-w-7xl items-center justify-between gap-3 px-6 py-6 max-md:flex-col md:gap-6 md:py-8'>
        <a href='#' className='text-zinc-100 transition-colors hover:text-white'>
          <div className='flex items-center gap-3'>
            <Logo className='gap-3' />
          </div>
        </a>

        <div className='flex items-center gap-5 whitespace-nowrap'>
          <a href='#' className='text-zinc-400 transition-colors duration-300 hover:text-zinc-100'>
            About
          </a>
          <a href='#' className='text-zinc-400 transition-colors duration-300 hover:text-zinc-100'>
            Features
          </a>
          <a href='#' className='text-zinc-400 transition-colors duration-300 hover:text-zinc-100'>
            Works
          </a>
          <a href='#' className='text-zinc-400 transition-colors duration-300 hover:text-zinc-100'>
            Career
          </a>
        </div>

        <div className='flex items-center gap-4'>
          <a href='#' className='text-zinc-400 transition-colors hover:text-zinc-100'>
            <FacebookIcon className='size-5' />
          </a>
          <a href='#' className='text-zinc-400 transition-colors hover:text-zinc-100'>
            <InstagramIcon className='size-5' />
          </a>
          <a href='#' className='text-zinc-400 transition-colors hover:text-zinc-100'>
            <TwitterIcon className='size-5' />
          </a>
          <a href='#' className='text-zinc-400 transition-colors hover:text-zinc-100'>
            <YoutubeIcon className='size-5' />
          </a>
        </div>
      </div>

      <div className='mx-auto flex max-w-7xl justify-center border-t border-white/10 px-6 py-7'>
        <p className='text-center font-medium text-balance text-zinc-400'>
          {`©${new Date().getFullYear()}`}{' '}
          <a href='#' className='text-zinc-200 transition-colors hover:text-white hover:underline'>
            shadcn/studio
          </a>
          , Made with Love for better web.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
